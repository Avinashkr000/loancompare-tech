package main

import (
	"context"
	"database/sql"
	"errors"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	_ "github.com/jackc/pgx/v5/stdlib"
	"golang.org/x/crypto/bcrypt"
)

type App struct { db *sql.DB; jwtSecret []byte }
type Claims struct { UserID string `json:"userId"`; Role string `json:"role"`; jwt.RegisteredClaims }
type User struct { ID string `json:"id"`; Email string `json:"email"`; FullName string `json:"fullName"`; Phone *string `json:"phone,omitempty"`; CreditScore *int `json:"creditScore,omitempty"`; Role string `json:"role"` }

func main() {
	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" { dsn = "postgres://postgres:postgres@localhost:5432/loancompare?sslmode=disable" }
	db, err := sql.Open("pgx", dsn); if err != nil { panic(err) }
	if err = db.Ping(); err != nil { panic(err) }
	secret := os.Getenv("JWT_SECRET"); if secret == "" { secret = "change-me-in-production" }
	a := &App{db: db, jwtSecret: []byte(secret)}

	r := gin.New(); r.Use(gin.Logger(), gin.Recovery())
	c := cors.DefaultConfig(); c.AllowOrigins = strings.Split(env("CORS_ORIGIN", "http://localhost:5173"), ","); c.AllowHeaders = []string{"Origin","Content-Type","Authorization"}; c.AllowMethods=[]string{"GET","POST","PUT","PATCH","OPTIONS"}; c.AllowCredentials=true; r.Use(cors.New(c))
	r.GET("/health", func(c *gin.Context){ c.JSON(http.StatusOK, gin.H{"status":"ok","service":"loancompare-api","runtime":"go"}) })
	api := r.Group("/api/v1")
	a.authRoutes(api); a.lenderRoutes(api); a.applicationRoutes(api); a.profileRoutes(api); a.adminRoutes(api)
	port := env("PORT", "4000"); r.Run(":"+port)
}
func env(k,d string) string { if v:=os.Getenv(k); v!="" { return v }; return d }
func (a *App) authRoutes(r *gin.RouterGroup) {
	x:=r.Group("/auth")
	x.POST("/register", func(c *gin.Context){ var in struct{Email,Password,FullName,Phone string}; if err:=c.ShouldBindJSON(&in);err!=nil||in.Email==""||len(in.Password)<8||len(in.FullName)<2{c.JSON(400,gin.H{"error":"Invalid registration details"});return}; in.Email=strings.ToLower(strings.TrimSpace(in.Email)); var n int; if a.db.QueryRowContext(c,`SELECT count(*) FROM "User" WHERE email=$1`,in.Email).Scan(&n);n>0{c.JSON(409,gin.H{"error":"Email already registered"});return}; h,_:=bcrypt.GenerateFromPassword([]byte(in.Password),12); id:=uuid.NewString(); _,err:=a.db.ExecContext(c,`INSERT INTO "User" (id,email,"passwordHash","fullName",phone,role,"createdAt","updatedAt") VALUES($1,$2,$3,$4,$5,'USER',NOW(),NOW())`,id,in.Email,string(h),in.FullName,in.Phone);if err!=nil{c.JSON(500,gin.H{"error":"Could not create account"});return}; u:=User{ID:id,Email:in.Email,FullName:in.FullName,Role:"USER"}; tok,_:=a.token(u);c.JSON(201,gin.H{"token":tok,"user":u}) })
	x.POST("/login", func(c *gin.Context){ var in struct{Email,Password string};if c.ShouldBindJSON(&in)!=nil{c.JSON(400,gin.H{"error":"Invalid credentials"});return};var u User;var hash string;err:=a.db.QueryRowContext(c,`SELECT id,email,"passwordHash","fullName",phone,"creditScore",role FROM "User" WHERE email=$1`,strings.ToLower(strings.TrimSpace(in.Email))).Scan(&u.ID,&u.Email,&hash,&u.FullName,&u.Phone,&u.CreditScore,&u.Role);if err!=nil||bcrypt.CompareHashAndPassword([]byte(hash),[]byte(in.Password))!=nil{c.JSON(401,gin.H{"error":"Invalid email or password"});return};tok,_:=a.token(u);c.JSON(200,gin.H{"token":tok,"user":u}) })
	x.GET("/me",a.auth(),func(c *gin.Context){c.JSON(200,gin.H{"user":c.MustGet("user")})})
}
func (a *App) lenderRoutes(r *gin.RouterGroup){ r.GET("/lenders",func(c *gin.Context){rows,err:=a.db.QueryContext(c,`SELECT id,name,slug,"baseRate","processingFee","minAmount","maxAmount","maxTenureMonths" FROM "Lender" WHERE active=true ORDER BY "baseRate" ASC`);if err!=nil{c.JSON(500,gin.H{"error":"Unable to load lenders"});return};defer rows.Close();out:=[]gin.H{};for rows.Next(){var id,name,slug string;var rate,fee,min,max float64;var tenure int;if rows.Scan(&id,&name,&slug,&rate,&fee,&min,&max,&tenure)==nil{out=append(out,gin.H{"id":id,"name":name,"slug":slug,"baseRate":rate,"processingFee":fee,"minAmount":min,"maxAmount":max,"maxTenureMonths":tenure})}};c.JSON(200,gin.H{"lenders":out})}) }
func (a *App) applicationRoutes(r *gin.RouterGroup){
	x:=r.Group("/applications",a.auth());x.GET("",a.listApplications);x.GET("/:id",a.getApplication);x.POST("",a.createApplication);x.POST("/:id/select-offer",a.selectOffer)
}
func (a *App) createApplication(c *gin.Context){var in struct{Amount float64 `json:"amount"`;TenureMonths int `json:"tenureMonths"`;CreditScore *int `json:"creditScore"`;Purpose string `json:"purpose"`};if c.ShouldBindJSON(&in)!=nil||in.Amount<=0||in.TenureMonths<=0{c.JSON(400,gin.H{"error":"Invalid application"});return};uid:=c.GetString("userId");id:=uuid.NewString();_,err:=a.db.ExecContext(c,`INSERT INTO "LoanApplication" (id,"userId",amount,"tenureMonths","creditScore",purpose,status,"createdAt","updatedAt") VALUES($1,$2,$3,$4,$5,$6,'SUBMITTED',NOW(),NOW())`,id,uid,in.Amount,in.TenureMonths,in.CreditScore,in.Purpose);if err!=nil{c.JSON(500,gin.H{"error":"Unable to create application"});return};c.JSON(201,gin.H{"application":gin.H{"id":id,"status":"SUBMITTED"}})}
func (a *App) listApplications(c *gin.Context){uid:=c.GetString("userId");rows,err:=a.db.QueryContext(c,`SELECT id,amount,"tenureMonths",purpose,status,"createdAt","updatedAt" FROM "LoanApplication" WHERE "userId"=$1 ORDER BY "createdAt" DESC`,uid);if err!=nil{c.JSON(500,gin.H{"error":"Unable to load applications"});return};defer rows.Close();out:=[]gin.H{};for rows.Next(){var id,purpose,status string;var amount float64;var tenure int;var created,updated time.Time;if rows.Scan(&id,&amount,&tenure,&purpose,&status,&created,&updated)==nil{out=append(out,gin.H{"id":id,"amount":amount,"tenureMonths":tenure,"purpose":purpose,"status":status,"createdAt":created,"updatedAt":updated})}};c.JSON(200,gin.H{"applications":out})}
func (a *App) getApplication(c *gin.Context){uid:=c.GetString("userId");var id,purpose,status string;var amount float64;var tenure int;err:=a.db.QueryRowContext(c,`SELECT id,amount,"tenureMonths",purpose,status FROM "LoanApplication" WHERE id=$1 AND "userId"=$2`,c.Param("id"),uid).Scan(&id,&amount,&tenure,&purpose,&status);if err!=nil{c.JSON(404,gin.H{"error":"Application not found"});return};rows,_:=a.db.QueryContext(c,`SELECT o.id,l.name,o."annualRate",o."processingFeePct",o.emi,o."totalInterest",o."totalPayable",o."eligibilityScore" FROM "LoanOffer" o JOIN "Lender" l ON l.id=o."lenderId" WHERE o."applicationId"=$1 ORDER BY o."eligibilityScore" DESC`,id);defer func(){if rows!=nil{rows.Close()}}();offers:=[]gin.H{};if rows!=nil{for rows.Next(){var oid,name string;var rate,fee,emi,interest,total float64;var score int;if rows.Scan(&oid,&name,&rate,&fee,&emi,&interest,&total,&score)==nil{offers=append(offers,gin.H{"id":oid,"lender":name,"annualRate":rate,"processingFeePct":fee,"emi":emi,"totalInterest":interest,"totalPayable":total,"eligibilityScore":score})}}};c.JSON(200,gin.H{"application":gin.H{"id":id,"amount":amount,"tenureMonths":tenure,"purpose":purpose,"status":status,"offers":offers}})}
func (a *App) selectOffer(c *gin.Context){uid:=c.GetString("userId");var n int;err:=a.db.QueryRowContext(c,`SELECT count(*) FROM "LoanApplication" WHERE id=$1 AND "userId"=$2`,c.Param("id"),uid).Scan(&n);if err!=nil||n==0{c.JSON(404,gin.H{"error":"Application not found"});return};var in struct{OfferID string `json:"offerId"`};if c.ShouldBindJSON(&in)!=nil||in.OfferID==""{c.JSON(400,gin.H{"error":"offerId is required"});return};_,err=a.db.ExecContext(c,`UPDATE "LoanApplication" SET "selectedOfferId"=$1,status='OFFER_SELECTED',"updatedAt"=NOW() WHERE id=$2`,in.OfferID,c.Param("id"));if err!=nil{c.JSON(500,gin.H{"error":"Unable to select offer"});return};c.JSON(200,gin.H{"status":"OFFER_SELECTED","offerId":in.OfferID})}
func (a *App) profileRoutes(r *gin.RouterGroup){x:=r.Group("/profile",a.auth());x.GET("",func(c *gin.Context){var u User;err:=a.db.QueryRowContext(c,`SELECT id,email,"fullName",phone,"creditScore",role FROM "User" WHERE id=$1`,c.GetString("userId")).Scan(&u.ID,&u.Email,&u.FullName,&u.Phone,&u.CreditScore,&u.Role);if err!=nil{c.JSON(404,gin.H{"error":"User not found"});return};c.JSON(200,gin.H{"user":u})});x.PUT("",func(c *gin.Context){var in struct{FullName string `json:"fullName"`;Phone string `json:"phone"`;CreditScore *int `json:"creditScore"`};if c.ShouldBindJSON(&in)!=nil{c.JSON(400,gin.H{"error":"Invalid profile"});return};_,err:=a.db.ExecContext(c,`UPDATE "User" SET "fullName"=$1,phone=$2,"creditScore"=$3,"updatedAt"=NOW() WHERE id=$4`,in.FullName,in.Phone,in.CreditScore,c.GetString("userId"));if err!=nil{c.JSON(500,gin.H{"error":"Unable to update profile"});return};c.JSON(200,gin.H{"status":"updated"})})}
func (a *App) adminRoutes(r *gin.RouterGroup){r.GET("/admin/overview",a.auth(),a.admin(),func(c *gin.Context){var users,apps,lenders int;a.db.QueryRow(`SELECT count(*) FROM "User"`).Scan(&users);a.db.QueryRow(`SELECT count(*) FROM "LoanApplication"`).Scan(&apps);a.db.QueryRow(`SELECT count(*) FROM "Lender" WHERE active=true`).Scan(&lenders);c.JSON(200,gin.H{"users":users,"applications":apps,"activeLenders":lenders})})}
func (a *App) auth() gin.HandlerFunc{return func(c *gin.Context){h:=c.GetHeader("Authorization");if !strings.HasPrefix(h,"Bearer "){c.AbortWithStatusJSON(401,gin.H{"error":"Authentication required"});return};tok,err:=jwt.ParseWithClaims(strings.TrimPrefix(h,"Bearer "),&Claims{},func(t *jwt.Token)(interface{},error){if t.Method.Alg()!=jwt.SigningMethodHS256.Alg(){return nil,errors.New("invalid signing method")};return a.jwtSecret,nil});if err!=nil||!tok.Valid{c.AbortWithStatusJSON(401,gin.H{"error":"Invalid token"});return};cl:=tok.Claims.(*Claims);c.Set("userId",cl.UserID);c.Set("role",cl.Role);c.Set("user",gin.H{"id":cl.UserID,"role":cl.Role});c.Next()}}
func (a *App) admin() gin.HandlerFunc{return func(c *gin.Context){if c.GetString("role")!="ADMIN"{c.AbortWithStatusJSON(403,gin.H{"error":"Admin access required"});return};c.Next()}}
func (a *App) token(u User)(string,error){return jwt.NewWithClaims(jwt.SigningMethodHS256,&Claims{UserID:u.ID,Role:u.Role,RegisteredClaims:jwt.RegisteredClaims{ExpiresAt:jwt.NewNumericDate(time.Now().Add(24*time.Hour)),IssuedAt:jwt.NewNumericDate(time.Now())}}).SignedString(a.jwtSecret)}
var _ = context.Background
var _ = strconv.Itoa

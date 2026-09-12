package main

import (
	"math"
	"net/http"

	"github.com/gin-gonic/gin"
)

func (a *App) compareRoutes(r *gin.RouterGroup) {
	r.POST("/lenders/compare", a.compare)
}

type compareRequest struct {
	Amount       float64 `json:"amount"`
	TenureMonths int     `json:"tenureMonths"`
	CreditScore  int     `json:"creditScore"`
	Purpose      string  `json:"purpose"`
}

func emi(principal, annualRate float64, months int) float64 {
	if months <= 0 { return 0 }
	r := annualRate / 12 / 100
	if r == 0 { return principal / float64(months) }
	factor := math.Pow(1+r, float64(months))
	return principal * r * factor / (factor - 1)
}

func (a *App) compare(c *gin.Context) {
	var in compareRequest
	if c.ShouldBindJSON(&in) != nil || in.Amount <= 0 || in.TenureMonths <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error":"amount and tenureMonths are required"}); return
	}
	rows, err := a.db.QueryContext(c, `SELECT id,name,"baseRate","processingFee","minAmount","maxAmount","maxTenureMonths" FROM "Lender" WHERE active=true ORDER BY "baseRate" ASC`)
	if err != nil { c.JSON(500, gin.H{"error":"Unable to compare lenders"}); return }
	defer rows.Close()
	offers := []gin.H{}
	for rows.Next() {
		var id,name string; var rate,fee,min,max float64; var maxTenure int
		if rows.Scan(&id,&name,&rate,&fee,&min,&max,&maxTenure) != nil { continue }
		if in.Amount < min || in.Amount > max || in.TenureMonths > maxTenure { continue }
		e := emi(in.Amount, rate, in.TenureMonths)
		total := e * float64(in.TenureMonths)
		feeAmount := in.Amount * fee / 100
		score := 70
		if in.CreditScore >= 750 { score += 20 } else if in.CreditScore >= 700 { score += 12 } else if in.CreditScore >= 650 { score += 5 }
		if rate <= 11 { score += 5 }
		offers = append(offers, gin.H{"lenderId":id,"lender":name,"annualRate":rate,"processingFeePct":fee,"processingFee":feeAmount,"emi":math.Round(e*100)/100,"totalInterest":math.Round((total-in.Amount)*100)/100,"totalPayable":math.Round((total+feeAmount)*100)/100,"eligibilityScore":score})
	}
	c.JSON(200, gin.H{"offers":offers,"count":len(offers)})
}

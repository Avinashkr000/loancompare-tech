# Docker deployment

1. Set a strong `JWT_SECRET` in the environment.
2. Run `docker compose up --build -d`.
3. Open port 8080 behind your TLS reverse proxy.
4. Back up the `loancompare_pg` volume.
5. Replace demo seed credentials and illustrative lender data before production use.

# Security notes

This repository is a prototype and is not a regulated lending production system yet.

Before production, replace seeded credentials, move secrets into a managed secret store, add rate limiting, refresh-token rotation, CSRF strategy for cookie-based auth if adopted, encryption/key management, input/file scanning, consent records, bureau-provider controls, webhook signature validation, structured audit events and centralized observability.

Port 465: This port is used for SMTP over SSL (Secure Sockets Layer). This is a legacy port for secure email transmission.


Port 587: This port is used for SMTP over TLS (Transport Layer Security). This is the recommended port for secure email transmission.


Differences Between Ports 465 and 587

Port 465 (SSL): This port establishes an SSL connection right from the start. It is considered deprecated but still widely used.

Port 587 (TLS): This port starts with a non-encrypted connection and then upgrades to a secure connection using the STARTTLS command. This is the modern standard for email transmission.


Which Port to Use?


Port 587 (TLS) is the preferred and recommended port for modern email services because it uses the STARTTLS command to upgrade to a secure connection, which is more flexible and secure.


Port 465 (SSL) can be used if you encounter issues with port 587 or if your specific use case requires it.
const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();

app.use("/api/users", createProxyMiddleware({ target: "http://localhost:5001", changeOrigin: true }));
app.use("/api/payments", createProxyMiddleware({ target: "http://localhost:5002", changeOrigin: true }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`API Gateway running on port ${PORT}`));

const rateLimit = require("express-rate-limit");

// 1. გლობალური ლიმიტერი მთლიანი API-სთვის
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 წუთი (დროის ფანჯარა)
  max: 100, // მაქსიმუმ 100 რექვესტი ამ 15 წუთში თითო IP-დან
  message: {
    status: 429,
    message:
      "ძალიან ბევრი მოთხოვნა გაიგზავნა ამ IP-დან. გთხოვთ სცადოთ 15 წუთის შემდეგ.",
  },
  standardHeaders: true, // აბრუნებს Standard RateLimit-* ჰედერებს პასუხში
  legacyHeaders: false, // თიშავს ძველ X-RateLimit-* ჰედერებს
});

// 2. მკაცრი ლიმიტერი ავტორიზაციის ენდპოინტებისთვის (Login/Register)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 წუთი
  max: 5, // მაქსიმუმ 5 მცდელობა!
  message: {
    status: 429,
    message:
      "უსაფრთხოების მიზნით, ავტორიზაციის მცდელობები შეზღუდულია. სცადეთ 15 წუთში.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  globalLimiter,
  authLimiter,
};

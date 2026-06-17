const cron = require("node-cron");
const mongoose = require("mongoose");

// ფუნქცია, რომელიც აგზავნის პინგს MongoDB Atlas-ზე
const keepDatabaseAlive = async () => {
  try {
    console.log(
      "[CRON] :satellite: ატლასის ბაზის გამოფხიზლება (Keep-Alive)...",
    );

    // ვამოწმებთ, საერთოდ არის თუ არა კავშირი ბაზასთან
    if (mongoose.connection.readyState === 1) {
      // აგზავნის უმარტივეს პინგს ადმინ ბრძანებით
      await mongoose.connection.db.admin().ping();
      console.log(
        "[CRON] :white_check_mark: Atlas-ის პინგი წარმატებულია. ბაზა აქტიურია!",
      );
    } else {
      console.log(
        "[CRON] :warning: ბაზასთან კავშირი არ არის აქტიური, პინგი ვერ გაიგზავნა.",
      );
    }
  } catch (error) {
    console.error("[CRON ERROR] ვერ მოხერხდა ბაზის პინგი:", error.message);
  }
};

// პერიოდულობა: "0 0 */2 * *"
// ეს ნიშნავს: ყოველ მე-2 დღეს, ღამის 00:00 საათზე
module.exports = cron.schedule("0 0 */2 * *", keepDatabaseAlive, {
  scheduled: false,
  timezone: "Asia/Tbilisi",
});

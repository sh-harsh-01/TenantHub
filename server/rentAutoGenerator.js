const cron = require('node-cron');
const Renter = require('./models/Renter');
const RoomBill = require('./models/RoomBill');
const AppConfig = require('./models/AppConfig');

console.log("Starting cron job...");

cron.schedule('0 0 * * *', async () => {
  try {
    const config = await AppConfig.getSingleton();
    const rentDueDay = config.rentDueDay || 1;

    const renters = await Renter.find({ role: { $ne: "admin" } });

    if (!renters || renters.length === 0) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (today.getDate() !== rentDueDay) return; // only run on the configured day

    for (let renter of renters) {
      console.log(`Creating bill for renter: ${renter.fullName}`);
      await RoomBill.create({
        renterId: renter._id.toString(),
        amountDue: renter.monthlyRent,
        dueDate: today,
        status: 'pending',
      });

      // Move next due date to next month
      const nextDue = new Date(renter.nextRentDueDate);
      nextDue.setMonth(nextDue.getMonth() + 1);
      renter.nextRentDueDate = nextDue;
      await renter.save();
    }

    console.log('✅ Rent bills generated for due renters.');
  } catch (err) {
    console.error('❌ Error in rent auto-generation:', err);
  }
});

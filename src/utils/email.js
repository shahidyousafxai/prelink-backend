// Stub until an email provider is set up — logs instead of sending.
const sendEmail = async ({ to, subject, text }) => {
  console.log(`[email] to=${to} subject="${subject}"\n${text}`);
};

module.exports = { sendEmail };

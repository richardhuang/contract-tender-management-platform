const nodemailer = require('nodemailer');

// Create transporter for sending emails
const transporter = nodemailer.createTransporter({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Send email notification
const sendEmailNotification = async (to, subject, html) => {
  try {
    const mailOptions = {
      from: process.env.FROM_EMAIL || '"Contract Management Platform" <noreply@example.com>',
      to,
      subject,
      html
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent:', result.messageId);
    return result;
  } catch (error) {
    console.error('Email sending error:', error);
    throw error;
  }
};

// Send contract creation notification
const sendContractCreatedNotification = async (contract, recipients) => {
  const html = `
    <h2>New Contract Created</h2>
    <p><strong>Title:</strong> ${contract.title}</p>
    <p><strong>Contract Number:</strong> ${contract.contract_number}</p>
    <p><strong>Type:</strong> ${contract.type}</p>
    <p><strong>Value:</strong> ${contract.currency} ${contract.value}</p>
    <p><strong>Status:</strong> ${contract.status}</p>
    <p>Please review and take necessary actions.</p>
  `;

  for (const recipient of recipients) {
    await sendEmailNotification(recipient, 'New Contract Created', html);
  }
};

// Send tender publication notification
const sendTenderPublishedNotification = async (tender, recipients) => {
  const html = `
    <h2>New Tender Published</h2>
    <p><strong>Title:</strong> ${tender.title}</p>
    <p><strong>Tender Number:</strong> ${tender.tender_number}</p>
    <p><strong>Description:</strong> ${tender.description}</p>
    <p><strong>Budget:</strong> ${tender.budget}</p>
    <p><strong>Bid Deadline:</strong> ${tender.end_date}</p>
    <p>Interested vendors can now submit their proposals.</p>
  `;

  for (const recipient of recipients) {
    await sendEmailNotification(recipient, 'New Tender Published', html);
  }
};

// Send bid received notification
const sendBidReceivedNotification = async (bid, recipients) => {
  const html = `
    <h2>New Bid Received</h2>
    <p><strong>Tender:</strong> ${bid.tender.title}</p>
    <p><strong>Vendor:</strong> ${bid.vendor.company_name}</p>
    <p><strong>Bid Amount:</strong> ${bid.bid_amount}</p>
    <p><strong>Submitted At:</strong> ${bid.submitted_at}</p>
    <p>Please review the bid and take necessary actions.</p>
  `;

  for (const recipient of recipients) {
    await sendEmailNotification(recipient, 'New Bid Received', html);
  }
};

// Send contract expiry reminder
const sendContractExpiryReminder = async (contract, recipients) => {
  const html = `
    <h2>Contract Expiry Reminder</h2>
    <p><strong>Title:</strong> ${contract.title}</p>
    <p><strong>Contract Number:</strong> ${contract.contract_number}</p>
    <p><strong>End Date:</strong> ${contract.end_date}</p>
    <p>This contract is approaching its expiry date. Please take necessary actions.</p>
  `;

  for (const recipient of recipients) {
    await sendEmailNotification(recipient, 'Contract Expiry Reminder', html);
  }
};

module.exports = {
  sendEmailNotification,
  sendContractCreatedNotification,
  sendTenderPublishedNotification,
  sendBidReceivedNotification,
  sendContractExpiryReminder
};
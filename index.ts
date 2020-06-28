// Interval minutes
const FETCH_INTERVAL_MINUTES = 60 * 6;

function fetchPublishedMails() {
    const now = Math.floor(new Date().getTime() / 1000);
    const timeTerm = now - (60 * FETCH_INTERVAL_MINUTES);
    const strTerms = 'after:' + timeTerm + ' from:notifications@npmjs.com successfully published';
    const mailThreads = GmailApp.search(strTerms);
    const mailMessages = GmailApp.getMessagesForThreads(mailThreads);
    if (mailMessages.length === 0) {
        return null;
    }
    const toMail = mailMessages[0][0].getTo();
    const messages = mailMessages.map(messege => {
        const gmailMessage = messege.slice(-1)[0];
        return `- ${gmailMessage.getDate().toISOString()} | ${gmailMessage.getSubject().replace("Successfully published ", "")}`
    });
    return {
        to: toMail,
        messages,
    };

}

/**
 * Creates two time-driven triggers.
 */
function createTimeTrikker() {
    ScriptApp.newTrigger('main')
        .timeBased()
        .everyMinutes(FETCH_INTERVAL_MINUTES)
        .create();
}

function main() {
    const newMails = fetchPublishedMails()
    if (!newMails) {
        console.log("No new mail");
        return;
    }
    console.log("New mail " + newMails.messages.length + " @ " + newMails.to);
    GmailApp.sendEmail(newMails.to, "npm published digest", newMails.messages.join("\n"));
}

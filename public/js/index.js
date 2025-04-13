let experienceTimer = 0;

const msInSecond = 1000;
const msInMinute = 60000;
const msInHour = 3.6e6;
const msInDay = 8.64e7;
const msInMonth = msInDay * 30;
const msInYear = 3.154e10;

const visionMonths = 41;
const raveMonths = 25;
const legacyMS = (visionMonths + raveMonths) * msInMonth;

const eriksHireDate = "2021-11-01";
const eriksHireDateMS = Date.parse(eriksHireDate);

const currentExperienceValues = {
  years: 0,
  months: 0,
  days: 0,
  minutes: 0,
  seconds: 0,
};

const resetCurrentExperienceValues = () => {
  currentExperienceValues.years = 0;
  currentExperienceValues.months = 0;
  currentExperienceValues.days = 0;
  currentExperienceValues.hours = 0;
  currentExperienceValues.minutes = 0;
  currentExperienceValues.seconds = 0;
};

const updateExperience = () => {
  const rightNow = Date.now();
  const newExperienceMS = rightNow - eriksHireDateMS;

  const currentExperienceMS = newExperienceMS + legacyMS;

  const years = Math.floor(currentExperienceMS / msInYear);
  const yearsRemainder = currentExperienceMS % msInYear;

  const months = Math.floor(yearsRemainder / msInMonth);
  const monthsRemainder = yearsRemainder % msInMonth;

  const days = Math.floor(monthsRemainder / msInDay);
  const daysRemainder = monthsRemainder % msInDay;

  const hours = Math.floor(daysRemainder / msInHour);
  const hoursRemainder = daysRemainder % msInHour;

  const minutes = Math.floor(hoursRemainder / msInMinute);
  const minutesRemainder = hoursRemainder % msInMinute;

  const seconds = (minutesRemainder / msInSecond).toFixed(3);

  // Plenty of conditionals to prevent superfluous DOM updates.
  if (currentExperienceValues.years !== years) {
    $("#years").innerText = `${years} years`;
    currentExperienceValues.years = years;
  }

  if (currentExperienceValues.months !== months) {
    $("#months").innerText = `${months} month${months !== 1 ? "s" : ""}`;
    currentExperienceValues.months = months;
  }

  if (currentExperienceValues.days !== days) {
    $("#days").innerText = `${days} day${days !== 1 ? "s" : ""}`;
    currentExperienceValues.days = days;
  }

  if (currentExperienceValues.hours !== hours) {
    $("#hours").innerText = `${hours} hour${hours !== 1 ? "s" : ""}`;
    currentExperienceValues.hours = hours;
  }

  if (currentExperienceValues.minutes !== minutes) {
    $("#minutes").innerText = `${minutes} minute${minutes !== 1 ? "s" : ""}`;
    currentExperienceValues.minutes = minutes;
  }

  if (currentExperienceValues.seconds !== seconds) {
    $("#seconds").innerText = `${seconds} second${seconds !== 1 ? "s" : ""}`;
    currentExperienceValues.seconds = seconds;
  }
};

// Setting this up dynamically so that search engines
// can read the static HTML in the index file. These
// values are hard coded from when I wrote this to
// minimize the amount of jank when the first
// updateExperience() fires.
const initExperienceSpan = () => {
  $(
    "#experience"
  ).innerHTML = `<span id="years">8 years</span>, <span id="months">10 months</span>, <span id="days">18 days</span>, <span id="hours">20 hours</span>, <span id="minutes">43 minutes</span> and <span id="seconds">57.666 seconds</span>`;

  const experienceElement = $("#experience");
  experienceElement.innerHTML = `<span id="years">8 years</span>, <span id="months">5 months</span>, <span id="days">18 days</span>, <span id="hours">20 hours</span>, <span id="minutes">43 minutes</span> and <span id="seconds">57.666 seconds</span>`;
};

const startCountup = () => {
  experienceTimer = setInterval(() => {
    updateExperience();
  }, 250);
  cleanupList.push({ type: "setInterval", variable: experienceTimer });
};

export const runOnImport = () => {
  initExperienceSpan();
  resetCurrentExperienceValues();
  startCountup();
};

runOnImport();

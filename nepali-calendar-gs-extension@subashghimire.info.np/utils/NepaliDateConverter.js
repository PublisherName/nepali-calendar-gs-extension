import { readJsonFile, convertToNepaliNumber } from './Helper.js';

const yearDataCache = new Map();

const nepaliCalendarData = {
  81: {
    monthDays: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
    totalDays: 366,
  },
  82: {
    monthDays: [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 30, 30],
    totalDays: 365,
  },
  83: {
    monthDays: [31, 31, 32, 31, 31, 30, 30, 30, 29, 30, 30, 30],
    totalDays: 365,
  },
  84: {
    monthDays: [31, 31, 32, 31, 31, 30, 30, 30, 29, 30, 30, 30],
    totalDays: 365,
  },
  85: {
    monthDays: [31, 32, 31, 32, 30, 31, 30, 30, 29, 30, 30, 30],
    totalDays: 365,
  },
};

export const getYearDataFromCache = (year, extensionPath) => {
  if (!year || isNaN(year)) {
    throw new Error('Invalid year parameter');
  }
  if (!yearDataCache.has(year)) {
    try {
      const data = readJsonFile(`data/${year}.json`, extensionPath);
      if (Object.keys(data).length === 0) {
        // eslint-disable-next-line no-console
        console.warn(`No data found for year ${year}`);
      }
      yearDataCache.set(year, data);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(`Failed to load data for year ${year}:`, error);
      return null;
    }
  }
  return yearDataCache.get(year);
};

export const getCurrentNepaliDate = () => {
  const currentDateEnglish = new Date();
  const referenceNepaliDate = [2081, 1, 1];
  const referenceEnglishDate = new Date(2024, 3, 13);

  const dayDifference = Math.floor(
    (currentDateEnglish - referenceEnglishDate) / (1000 * 3600 * 24)
  );
  const [yearOffset, monthOffset, dayOffset] =
    calculateNepaliDateDifference(dayDifference);
  const dateOffset = [yearOffset, monthOffset, dayOffset];
  const adjustedNepaliDate = adjustNepaliDate(referenceNepaliDate, dateOffset);

  return {
    nepaliYear: adjustedNepaliDate[0],
    nepaliMonth: adjustedNepaliDate[1],
    nepaliDay: adjustedNepaliDate[2],
    nepaliDayOfWeek: currentDateEnglish.getDay() + 1,
    englishDate: currentDateEnglish.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
    }),
  };
};

export const formatNepaliDateData = (nepaliDate, extensionPath) => {
  const nepaliMonths = [
    'बैशाख',
    'जेठ',
    'असार',
    'साउन',
    'भदौ',
    'असोज',
    'कार्तिक',
    'मंसिर',
    'पुष',
    'माघ',
    'फाल्गुन',
    'चैत',
  ];
  const nepaliWeekDays = [
    'आइतबार',
    'सोमबार',
    'मंगलबार',
    'बुधबार',
    'बिहीबार',
    'शुक्रबार',
    'शनिबार',
  ];

  const formattedYear = convertToNepaliNumber(nepaliDate.nepaliYear);
  const formattedMonth = nepaliMonths[nepaliDate.nepaliMonth - 1];
  const formattedDay = convertToNepaliNumber(nepaliDate.nepaliDay);
  const formattedDayOfWeek = nepaliWeekDays[nepaliDate.nepaliDayOfWeek - 1];

  const { tithi, event } = getTithiAndEventForNepaliDate(
    nepaliDate,
    extensionPath
  );

  return {
    nepaliYear: formattedYear,
    nepaliMonth: formattedMonth,
    nepaliDay: formattedDay,
    nepaliDayOfWeek: formattedDayOfWeek,
    englishDate: nepaliDate.englishDate,
    nepaliTithi: tithi,
    nepaliEvent: event,
  };
};

const calculateNepaliDateDifference = (dayDifference) => {
  let yearOffset = 0,
    monthOffset = 0,
    startYear = '81',
    stopLoop = false;
  while (true) {
    while (!stopLoop) {
      if (dayDifference > nepaliCalendarData[startYear]['totalDays']) {
        yearOffset++;
        dayDifference -= nepaliCalendarData[startYear]['totalDays'];
      } else {
        for (
          let i = 0;
          i < nepaliCalendarData[startYear]['monthDays'].length;
          i++
        ) {
          const daysInMonth = nepaliCalendarData[startYear]['monthDays'][i];
          if (dayDifference >= daysInMonth) {
            monthOffset++;
            dayDifference -= daysInMonth;
          } else {
            stopLoop = true;
            break;
          }
        }
      }
      if (!stopLoop) {
        startYear++;
      }
    }
    return [yearOffset, monthOffset, dayDifference];
  }
};

const adjustNepaliDate = (referenceDate, dateOffset) => {
  let month;

  for (let i = 0; i < referenceDate.length; i++) {
    dateOffset[i] += referenceDate[i];
    if (i === 1) {
      if (dateOffset[i] >= 13) {
        dateOffset[i] -= 12;
        dateOffset[i - 1] += 1;
      }
      month = dateOffset[i];
    }
  }
  return [dateOffset[0], month, dateOffset[2]];
};

const getTithiAndEventForNepaliDate = (nepaliDate, extensionPath) => {
  const data = getYearDataFromCache(nepaliDate.nepaliYear, extensionPath);
  let tithi = '-';
  let event = '-';

  if (data[nepaliDate.nepaliMonth - 1]) {
    const dayData = data[nepaliDate.nepaliMonth - 1].days.find(
      (d) => d.dayInEn === nepaliDate.nepaliDay.toString()
    );
    if (dayData) {
      tithi = dayData.tithi || '-';
      event = dayData.event || '-';
    }
  }
  return { tithi, event };
};

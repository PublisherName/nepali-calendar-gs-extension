import GLib from 'gi://GLib';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';

const Me = Main.extensionManager.lookup('nepali-calendar-gs-extension@subashghimire.info.np');

export const readJSONFile = (filePath) => {
    try {
        const fullPath = `${Me.path}/${filePath}`;
        let fileContent = GLib.file_get_contents(fullPath)[1];
        let decoder = new TextDecoder('utf-8');
        let jsonString = decoder.decode(fileContent);
        return JSON.parse(jsonString);
    } catch (e) {
        log(`Error reading JSON file: ${filePath}`);
        return {};
    }
}

export const getNepaliDate = () => {
    const nepcal = {
        81: {
            mon_days: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
            tot_days: 366,
        },
        82: {
            mon_days: [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 30, 30],
            tot_days: 365,
        },
        83: {
            mon_days: [31, 31, 32, 31, 31, 30, 30, 30, 29, 30, 30, 30],
            tot_days: 365,
        },
        84: {
            mon_days: [31, 31, 32, 31, 31, 30, 30, 30, 29, 30, 30, 30],
            tot_days: 365,
        },
        85: {
            mon_days: [31, 32, 31, 32, 30, 31, 30, 30, 29, 30, 30, 30],
            tot_days: 365,
        }
    };

    const ref_date_nep = [2081, 1, 1];
    const ref_date_eng = new Date(2024, 3, 13);
    const inp_date_eng = new Date();

    let day_diff = Math.floor((inp_date_eng - ref_date_eng) / (1000 * 3600 * 24));
    let month_diff = 0;
    let year_diff = 0;
    let stop_loop = false;
    let start_year = '81';

    while (!stop_loop) {
        if (day_diff > nepcal[start_year]['tot_days']) {
            year_diff++;
            day_diff -= nepcal[start_year]['tot_days'];
        } else {
            for (let i = 0; i < nepcal[start_year]['mon_days'].length; i++) {
                let days_mon = nepcal[start_year]['mon_days'][i];
                if (day_diff >= days_mon) {
                    month_diff++;
                    day_diff -= days_mon;
                } else {
                    stop_loop = true;
                    break;
                }
            }
        }
        if (!stop_loop) {
            start_year++;
        }
    }

    let date_diff = [year_diff, month_diff, day_diff];

    for (let i = 0; i < ref_date_nep.length; i++) {
        date_diff[i] += ref_date_nep[i];
        if (i == 1) {
            if (date_diff[i] >= 13) {
                date_diff[i] -= 12;
                date_diff[i - 1] += 1;
            }
            var month = date_diff[i];
        }
    }

    return {
        npYear: date_diff[0],
        npMonth: month,
        npDay: date_diff[2],
        npDayName: inp_date_eng.getDay() + 1,
        enDate: inp_date_eng.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' })
    }
}



export const formatExtractData = (nepaliDate) => {
    const months = [
        'बैशाख', 'जेठ', 'असार', 'साउन', 'भदौ', 'असोज', 'कार्तिक', 'मंसिर', 'पुष', 'माघ', 'फाल्गुन', 'चैत'
    ];

    const daysOfWeek = ["आइतबार", "सोमबार", "मंगलबार", "बुधबार", "बिहीबार", "शुक्रबार", "शनिबार"];

    const year = nepaliDate.npYear.toString().split('').map(num => '०१२३४५६७८९'[num]).join('');;
    const month = months[nepaliDate.npMonth - 1];
    const day = nepaliDate.npDay.toString().split('').map(num => '०१२३४५६७८९'[num]).join('');;
    const dayName = daysOfWeek[nepaliDate.npDayName - 1];

    const data = readJSONFile(`data/${nepaliDate.npYear}.json`);
    let tithi = '-';
    let event = '-';

    if (data[nepaliDate.npMonth - 1]) {
        const days = data[nepaliDate.npMonth - 1].days;
        const dayData = days.find(d => d.dayInEn === nepaliDate.npDay.toString());
        if (dayData) {
            tithi = dayData.tithi || '-';
            event = dayData.event || '-';
        }
    }

    return {
        npYear: year,
        npMonth: month,
        npDay: day,
        npDayName: dayName,
        enDate: nepaliDate.enDate,
        npTithi: tithi,
        npEvent: event
    };
}
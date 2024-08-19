namespace Module {

    export type Patient = string[];

    export const getInputSheet: Sheet = (id, sheetName) => {
               const ss: SpreadsheetApp = SpreadsheetApp.openById(id);
               const inputSheet: Sheet = ss.getSheetByName(sheetName);
               return inputSheet;
    }

    export const getDates = (sheet, range) => {
        return sheet.getRange(range)
            .getValues()
            .flat()
            .filter(value => value !== '');
    }

    export const getPatientsByDay = (sheet: Sheet, dayRange: string): string[][] => (
        sheet.getRange(dayRange)
            .getValues()
            /*.filter(patient => {
                return patient[8] === 1
            })*/
    );

    const formatDate = (date: Date) => {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Enero es 0
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    }

    const parseDateToString = (dates: Date) => (
        dates.map(date => formatDate(date))
    )

    export const getPatients = (fortnightlyRanges: String[][], inputSheet: Sheet) => (
       fortnightlyRanges.flat().reduce((patients, curRangeDay) => {
           const patientsByDay = Module.getPatientsByDay(patients.sheet, curRangeDay);
           patients.data.push(patientsByDay);
           return patients;
       }, {sheet: inputSheet, data: []})
    )

    const depureDayBySessions = (data: Patient[]) => data.reduce((patientsDay, currPatientDay, idx) => {
        const totalSessionsByDay = currPatientDay.map((patientRow, idx) => idx >= 2 ? patientRow[8] : 0)
        const sessionsExist = totalSessionsByDay.some(sessionValue => sessionValue === 1);
        if(sessionsExist){
            patientsDay.push(currPatientDay);
        }
        return patientsDay;
    },[])

    const depureByColumns = (data: Patient[]) => data.map(
       patientsData => patientsData.map(
           patient => [patient[1], patient[2], patient[8], patient[9]])
    );

    const  depureWithSessions = (data: Patient[]) => (
       data.map(patientByDay => patientByDay.filter(patient => patient[2] === 1))
    )

    const replaceHourByDate = (data: Patient[]) => data.map(patientsDay => {
        const date = patientsDay[0][0];
        const dateString = formatDate(date);
        //console.log(dateString)
        return patientsDay.map(patient => {
            patient.push(dateString);
            return patient;
        })
    })

    const groupByDocument = (data: Patient[]) => {
        return data.reduce((patients, curPatientsDay, i) => {
            //const patientDocument = curPatientsDay[idx][1];
            const newPatientsDay = curPatientsDay.filter((patient, j) => {

                patient[1] === patientDocument
            });

            patients.push(curPatientsDay);
            return patients;
        },[])
    }


    export const depureData = (data: Patient[]) => {
        const patientsWithDaySessions = depureDayBySessions(data);
        const patientsWithDates = replaceHourByDate(patientsWithDaySessions);
        const patientsFilteredByColumns = depureByColumns(patientsWithDates);
        const patientsWithSessions = depureWithSessions(patientsFilteredByColumns);
        //const patientsGroupByName = groupByDocument(patientsWithSessions);
        return patientsWithSessions;
    };
    //export const sortData = (data: Patient[]) => {}

    export const patientDataToString = (data: Patient[]) => (
       data
           .flat()
           .map(patientArr => patientArr.map(patient => patient.toString()))
    );

    export const createDocument = (name: string) => DocumentApp.create(name)
    .getBody()
}

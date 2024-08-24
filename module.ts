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
        return patientsDay.map(patient => {
            patient.push(dateString);
            return patient;
        })
    })

    const groupByDocument = (data: Patient[]) => {
        const patientsDocumentsGroup = data.flat().map(patientDay => patientDay[1])
        const patientsDocuments = Array.from(new Set(patientsDocumentsGroup));
        const patients = [];
        for (let document of patientsDocuments) {
            const patientsByDocument = data.flat().filter(patient => patient[1] === document);
            const sessions = patientsByDocument.length;
            const datesArray = patientsByDocument.map(patient => patient[3]);
            const dates = datesArray.join('\n');
            const patient = [patientsByDocument[0][0], document, sessions, dates];
            patients.push(patient);
        }
        return patients;
    }

    const valuesToString = (patients: Patient[]) => (
        patients
            .map(patient => [patient[0], patient[1].toString(), patient[2].toString(), patient[3]])
    );

    export const depureData = (data: Patient[]) => {
        const patientsWithDaySessions = depureDayBySessions(data);
        const patientsWithDates = replaceHourByDate(patientsWithDaySessions);
        const patientsFilteredByColumns = depureByColumns(patientsWithDates);
        const patientsWithSessions = depureWithSessions(patientsFilteredByColumns);
        const patientsGroupByDocument = groupByDocument(patientsWithSessions);
        const patientValuesToString = valuesToString(patientsGroupByDocument)
        return patientValuesToString;
    };

    export const createDocument = (name: string) => DocumentApp.create(name)
    .getBody()
}

import Sheet = GoogleAppsScript.Spreadsheet.Sheet;

const run = () => {
    const spreadsSheetId = "1ZTgWI7qjW31vuiML2ODSX0FQuo-mtQ-L0-Vd7eLw2kw";
    const sheetName = "INPUT";
    const weekOneRanges = ["INPUT!A1:I24", "INPUT!L1:T24", "INPUT!W1:AE24", "INPUT!AH1:AP24"];
    const weekTwoRanges = ["INPUT!A28:I51", "INPUT!L28:T51", "INPUT!W28:AE51", "INPUT!AH28:AP51"];
    const fortnightlyRanges = [weekOneRanges, weekTwoRanges];
    const data = spreadsSheetProcessor(spreadsSheetId, sheetName, fortnightlyRanges);
    console.log(data)
    //console.log(data.length)
    const documentName = "Listado de pacientes ()"
    //const body = documentProcessor(data, documentName);
    //console.log(body)
}


const spreadsSheetProcessor = (spreadsSheetId: String,
                               sheetName: String,
                               fortnightlyRanges: String[][]
    ) => {
        const inputSheet: Sheet = Module.getInputSheet(spreadsSheetId, sheetName);
        /*const daysWeekOne = Module.getDates(inputSheet, "INPUT!A1:AP1");
        const daysWeekTwo = Module.getDates(inputSheet, "INPUT!A28:AP28");
        const dates = [daysWeekOne, daysWeekTwo];
        const datesParsed = Module.parseDateToString(dates);
        console.log(datesParsed)*/
        const patients = Module.getPatients(fortnightlyRanges, inputSheet);
        //console.log(patients.data)
        //const patientsData = Module.patientDataToString(patients.data);
        const depuredData = Module.depureData(patients.data);
        //const sortedData = Module.sortData(depuredData);
        return depuredData;
}

const documentProcessor = (data: string[][], name: string) => {
    const doc = Module.createDocument(name);
    return doc.appendTable(data);
}



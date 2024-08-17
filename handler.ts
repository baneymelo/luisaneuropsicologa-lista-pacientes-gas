const run = () => {
    const spreadsSheetId = "1ZTgWI7qjW31vuiML2ODSX0FQuo-mtQ-L0-Vd7eLw2kw";
    const sheetName = "INPUT";
    const patientList = spreadsSheetProcessor(spreadsSheetId, sheetName);
    console.log(patientList)
    const documentName = "Listado de pacientes ()"
    /* const body = documentProcessor(documentName);
    console.log(body) */
}


const spreadsSheetProcessor = (spreadsSheetId: String, sheetName: String) => {
    const inputSheet = Module.getInputSheet(spreadsSheetId, sheetName);
    const inputValues = inputSheet.getDataRange().getValues();
    const sanitizedData = Module.sanitizeByEmptyNameAndSession(inputValues);
    const filteredData = Module.filterByCells(sanitizedData);
    return Module.arrayToPatients(filteredData);
}

const documentProcessor = (name: String) => {
    return Module.createDocument(name);
}



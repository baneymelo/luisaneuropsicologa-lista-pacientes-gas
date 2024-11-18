import Sheet = GoogleAppsScript.Spreadsheet.Sheet;

const run = () => {
    console.log("starting process...");
    const spreadsSheetId = "1ZTgWI7qjW31vuiML2ODSX0FQuo-mtQ-L0-Vd7eLw2kw";
    const sheetName = "INPUT";
    const sheetData = spreadsSheetProcessor(spreadsSheetId, sheetName);
    const textProps = {
        headingTitle: "LISTADO DE PACIENTES"
    }
    const tableHeadings = ["NOMBRE", "DOCUMENTO", "SESIONES", "FECHAS DE ATENCIÓN"];
    sheetData.table.unshift(tableHeadings);
    documentProcessor(sheetData, textProps);
    //console.log(body)
}

const spreadsSheetProcessor = (spreadsSheetId: string,
                               sheetName: string
    ) => {
        console.log("processing data...");
        const inputSheet: Sheet = Module.getInputSheet(spreadsSheetId, sheetName);
        const fortnightlyNotations = Module.fortnightlyNotationsBuilder(inputSheet, "TOTAL ATENCIONES");
        const documentName = Module.getNameDocument(inputSheet, fortnightlyNotations[0], fortnightlyNotations[fortnightlyNotations.length - 1]);
        const patients = Module.getPatients(fortnightlyNotations, inputSheet);
        const depuredData = Module.depureData(patients.data);
        return {
            table: depuredData,
            documentName
        };
}

const documentProcessor = (sheetData: string[][], textProps: object) => {
    const doc = Module.createDocument(sheetData.documentName);
    const text = doc.appendParagraph(textProps.headingTitle + '\n');
    text.setBold(true);
    text.setFontSize(12);
    text.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
    const table = doc.appendTable(sheetData.table);
    table.setBold(false);
    table.setFontSize(10);
    console.log("document created successfully.");
    //const footer = doc.appendParagraph('\n***PACIENTES RESALTADOS: Paciente que Semper no me permitió ingresar porque son de Salud Total');
    //footer.setBold(false);
    //footer.setFontSize(10);
}



import Sheet = GoogleAppsScript.Spreadsheet.Sheet;

const run = () => {
    const spreadsSheetId = "1ZTgWI7qjW31vuiML2ODSX0FQuo-mtQ-L0-Vd7eLw2kw";
    const sheetName = "INPUT";
    const weekOneRanges = ["INPUT!A1:I24", "INPUT!L1:T24", "INPUT!W1:AE24", "INPUT!AH1:AP24"];
    const weekTwoRanges = ["INPUT!A28:I51", "INPUT!L28:T51", "INPUT!W28:AE51", "INPUT!AH28:AP51"];
    const fortnightlyRanges = [weekOneRanges, weekTwoRanges];
    const data = spreadsSheetProcessor(spreadsSheetId, sheetName, fortnightlyRanges);
    const textProps = {
        documentName: "Listado de pacientes ()",
        headingTitle: "LISTADO DE PACIENTES"
    }
    const tableHeadings = ["NOMBRE", "DOCUMENTO", "SESIONES", "FECHAS DE ATENCIÓN"];
    data.unshift(tableHeadings);
    documentProcessor(data, textProps);
    //console.log(body)
}


const spreadsSheetProcessor = (spreadsSheetId: string,
                               sheetName: string,
                               fortnightlyRanges: string[][]
    ) => {
        const inputSheet: Sheet = Module.getInputSheet(spreadsSheetId, sheetName);
        const patients = Module.getPatients(fortnightlyRanges, inputSheet);
        const depuredData = Module.depureData(patients.data);
        return depuredData;
}

const documentProcessor = (data: string[][], textProps: object) => {
    const doc = Module.createDocument(textProps.documentName);
    const text = doc.appendParagraph(textProps.headingTitle + '\n');
    text.setBold(true);
    text.setFontSize(12);
    text.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
    const table = doc.appendTable(data);
    table.setBold(false);
    table.setFontSize(10);
    const footer = doc.appendParagraph('\n***PACIENTES RESALTADOS: Paciente que Semper no me permitió ingresar porque son de Salud Total');
    footer.setBold(false);
    footer.setFontSize(10);
}



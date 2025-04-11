import Sheet = GoogleAppsScript.Spreadsheet.Sheet;

const doGet = () => HtmlService.createTemplateFromFile("page").evaluate();

const handler = (app: string) => {
    console.log("starting process...");

    switch (app) {
        case "app-1":
            return listadoPacientes();
        default:
            return;
    }
}

const listadoPacientes = () => {
    const spreadsSheetId = "1ZTgWI7qjW31vuiML2ODSX0FQuo-mtQ-L0-Vd7eLw2kw";
    const sheetName = "INPUT";
    const sheetData = spreadsSheetProcessor(spreadsSheetId, sheetName);
    const textProps = {
        headingTitle: "LISTADO DE PACIENTES"
    }
    /*const tableHeadings = ["NOMBRE", "DOCUMENTO", "FECHA DE AGENDAMIENTO", "TOTAL SESIONES"];
    sheetData.table.unshift(tableHeadings);
    const doc = documentProcessor(sheetData, textProps);
    gmailProcessor(doc);*/
}

const spreadsSheetProcessor = (spreadsSheetId: string,
                               sheetName: string
    ) => {
        console.log("processing data...");
        const inputSheet: SpreadSheet = Module.getInputSheet(spreadsSheetId, sheetName);
        const dataValues = Module.getDataValues(inputSheet);
        console.log(dataValues[][52])
        /*const fortnightlyNotations = Module.fortnightlyNotationsBuilder(inputSheet, "TOTAL ATENCIONES");
        const documentName = Module.getNameDocument(inputSheet, fortnightlyNotations[0], fortnightlyNotations[fortnightlyNotations.length - 1]);
        const patients = Module.getPatients(fortnightlyNotations, inputSheet);
        const depuredData = Module.depureData(patients.data);
        return {
            table: depuredData,
            documentName
        };*/
}


/*
* 1. get spreadsheet range.
* 2. sort data.
*    get X index HORA & TOTAL SESIONES. set DATE.
*    get Y index TOTAL ATENCIONES.
*    set object with: date,
* 3.
*
*
* */

const documentProcessor = (sheetData: string[][], textProps: object): Blob => {
    const doc = Module.createDocument(sheetData.documentName);

    const text = doc.getBody().appendParagraph(textProps.headingTitle + '\n');
    text.setBold(true);
    text.setFontSize(12);
    text.setAlignment(DocumentApp.HorizontalAlignment.CENTER);

    const table = doc.appendTable(sheetData.table);
    table.setBold(false);
    table.setFontSize(10);

    //return doc.getUrl();
    return doc;
}

const gmailProcessor = (doc: Document) => {
    const file = DriveApp.getFileById(doc.getId());
    const attachments = [file.getBlob()]
   // const attachements = [file.getAs(MimeType.MICROSOFT_WORD)]
    const options = { attachments }
    GmailApp.sendEmail("luisamontoya.neuropsi@gmail.com", "Listado de pacientes", "Listado de pacientes", options);
}



import Sheet = GoogleAppsScript.Spreadsheet.Sheet;

/*
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
*/

const listadoPacientes = () => {
    const spreadsSheetId = "1ZTgWI7qjW31vuiML2ODSX0FQuo-mtQ-L0-Vd7eLw2kw";
    const sheetName = "INPUT";
    const sheetData = spreadsSheetProcessor(spreadsSheetId, sheetName);
    const textProps = {
        headingTitle: "LISTADO DE PACIENTES"
    }
    const tableHeadings = ["NOMBRE", "DOCUMENTO", "FECHA DE AGENDAMIENTO", "TOTAL SESIONES"];
    /*sheetData.table.unshift(tableHeadings);
    const doc = documentProcessor(sheetData, textProps);
    gmailProcessor(doc);*/
}

const spreadsSheetProcessor = (spreadsSheetId: string,
                               sheetName: string
    ) => {
    console.log("processing data...");
    const inputSheet: SpreadSheet = Module.getInputSheet(spreadsSheetId, sheetName);
    const values = Module.getDataValues(inputSheet);

    // dataValues
    //console.log(values[5])

    const totalSesionsXY = Module.getTotalSesionsXY(values);
    const limits = {
        x: totalSesionsXY.x.flat().at(0),
        y: totalSesionsXY.y.flat().at(0)
    }
    const tableOne = Module.createTable(values, limits);
    console.log(tableOne)

    // transposing dataValues
    const transposed = Module.transpose(values);

    //console.log(transposed[0]);

    const { xy } = totalSesionsXY;
    //const table = xy.slice(0, 1);


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
* 1. get values.
* 2. sort data.
*    get XY index of TOTAL SESIONES.
* 3.
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



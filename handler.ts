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
        //console.log(Module.getData())
        const dataValues = Module.getDataValues(inputSheet);

        // recursividad
        const trail = (word, idx, arr, acc) => {
            const i = arr.indexOf(word, idx);
            if(i !== -1) {
                acc.push(i);
                return trail(word, i + 1, arr, acc);
            }
            return acc;
        }

        const reduce = dataValues.reduce((acc, row) => {
            acc.count++;
            const accRow = trail("TOTAL SESIONES", 0, row, []);
            if(accRow.length !== 0) {
                acc.xy.push([acc.count - 1]);
                acc.xy.push([...accRow]);
                acc.count = 0;
            }
            return acc;
        }, { count:0, xy:[] })

        //const  =


    console.log(reduce)


        //console.log(dataValues[][52])
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



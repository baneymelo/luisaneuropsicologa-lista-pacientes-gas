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
    const headings = ["NOMBRE", "DOCUMENTO", "FECHA DE AGENDAMIENTO", "TOTAL SESIONES"];
    const sheetData = spreadsSheetProcessor(spreadsSheetId, sheetName, headings);
    const textProps = {
        headingTitle: "LISTADO DE PACIENTES"
    }
    /*sheetData.table.unshift(tableHeadings);
    const doc = documentProcessor(sheetData, textProps);
    gmailProcessor(doc);*/
}

const spreadsSheetProcessor = (spreadsSheetId: string,
                               sheetName: string,
                               headings: string,
    ) => {
    console.log("Processor::starting..");
    const inputSheet: SpreadSheet = Module.getInputSheet(spreadsSheetId, sheetName);
    const values = Module.getDataValues(inputSheet);

    // determinate lower limits of each header
    const lowerLimits = Module.getHeaderXY(values, "TOTAL ATENCIONES")
    const headerlowerLimits = lowerLimits.y.map((loweLimit, idx) => idx % 2 === 0 ? loweLimit : []).flat();
    console.log(headerlowerLimits)

    // headers xy positions
    const headers = headings.reduce((acc, header) => {
        const key = header.toLowerCase().replaceAll(" ","");
        const value = Module.getHeaderXY(values, header);
        acc.limits.forEach((limit, idx) => {
            value.y.at(idx).push(limit)
        })
        acc[key] = value;
        return acc;
    }, {headers: {}, limits: headerlowerLimits} );
    console.log(headers.nombre)


    // determine range data
    const ranges = Module.getRange(values, headers.nombre.y.at(0));
    //console.log(ranges);

    const dataRanges = Module.getDataRange(ranges, headers.nombre.x.at(0));
    console.log(dataRanges);

    //const enrichLowerLimit = Module.enrichLowerLimit(headingsXY, LOWER_LIMIT);
    //console.log(enrichLowerLimit);

    // create table of each header



    /*const limits = {
        x: totalSesionsXY.x.flat().at(0),
        y: totalSesionsXY.y.flat().at(0)
    }*/
    // const tableOne = Module.createTable(values, limits);
    // console.log(tableOne)

    // transposing dataValues
    // const transposed = Module.transpose(values);



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



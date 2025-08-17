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

const utils = {
    enrichX: (x1, x2) => {
        const xLimit = x1.map((x1_, idx) => {
            const x2_ = x2[idx];
            return [x1_, x2_];
        });
        return xLimit;
        }
}

const getUniques = (array: number[]) => {
    const set = new Set(array);
    return [...set];
}

const recursiveBase = (acc, headerToLookFor, headerIdx, rowPosition, row) => {
    const newHeaderIdx = headerIdx === 2 ? 0 : headerIdx;
    const newRowPosition = rowPosition;
    const newHeaderToLookFor = headerToLookFor.at(newHeaderIdx);
    const i = row.indexOf(newHeaderToLookFor, newRowPosition);
    if(newRowPosition === row.length - 1){
        return acc;
    }
    if(i !== -1) {
        acc.push(i);
        newHeaderIdx++;
        newRowPosition = i - 1;
    }
    return recursiveBase(acc, headerToLookFor, newHeaderIdx, newRowPosition + 1, row);
}

const isValidXPosition = (xPositions: number[]) => xPositions.length % 2 === 0;

const composeCallback = (...functions) => (header) => {
    return functions.reduceRight((currentHeader, currentFun) => {
        return currentFun(currentHeader);
    }, header );
}

const separeteA1Notation = (notation: string) => {
    const match = notation.match(/([A-Z]+)(\d+)/);
    const column = match[1]
    const row = parseInt(match[2], 10)
    debugger
    return [column, row]
}

const redifineA1Notation = (arr: Array<string, number>) => `${arr.at(0)}${arr.at(1)-1}`


const listadoPacientes = () => {
    const spreadsSheetId = "1ZTgWI7qjW31vuiML2ODSX0FQuo-mtQ-L0-Vd7eLw2kw";
    const sheetName = "INPUT";
    const headings = ["HORA", "TOTAL ATENCIONES"];
    const sheetData = spreadsSheetProcessor(spreadsSheetId, sheetName, headings, utils);
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
                               utils: any
    ) => {
    console.log("Processor::starting..");
    const inputSheet: SpreadSheet = Module.getInputSheet(spreadsSheetId, sheetName);
    const data = Module.getDataValues(inputSheet);

    /*
    // table dimensions on x
    const recursiveBaseResult = data.reduce((acc, row, idx) => {
        const table = recursiveBase([], headings, 0, 0, row);
        if (table.length > 0) {
            acc.push(table);
        }
        return acc;
    });
    //console.log(recursiveBaseResult);

    // validate if xPositions are valid pair
    const protoXPositions = recursiveBaseResult.filter(r => Array.isArray(r));
    const xPositionsValidationResult = protoXPositions.reduce((acc, xPosition) => {
        if (isValidXPosition(xPosition)) {
            acc.xPositionsUngrouped.push(xPosition);
            return acc;
        }
        acc.isXPositionsValid = false;
        return acc;

    }, {xPositionsUngrouped: [], isXPositionsValid: true});

    const {xPositionsUngrouped, isXPositionsValid} = xPositionsValidationResult;

    if (!isXPositionsValid) return;

    // group xPositions
    const xPositionsGrouped = xPositionsUngrouped.map((xPosition, idx) => {
        const limit = xPosition.length - 1;
        const pairs = [];
        for (let i = 0; i < limit; i += 2) {
            pairs.push([xPosition[i], xPosition[i + 1]]);
        }
        return pairs;
    }).flat();

    //console.log(xPositionsGrouped)*/

    const ss = SpreadsheetApp.openById(spreadsSheetId)

    const getA1Notation = (occurences) => occurences.map(_ => _.getA1Notation());
    const getAllOccurrences = (header: RegExp) => {
        const textFinder = ss.createTextFinder(header).matchEntireCell(true);
        return textFinder.findAll()
    };

    const composeNotation = (header) => composeCallback(
        getA1Notation,
        getAllOccurrences
    )(header)

    const composeRenotation = (notation) => composeCallback(
        redifineA1Notation,
        separeteA1Notation
    )(notation)

    const headingNotations = headings.map(composeNotation);
    //console.log(headingNotations);

    const topLeft = headingNotations.at(0);
    const bottomRight = headingNotations.at(1); // TODO continue here. get the dimension of tables and filter just the odds
    const notationRanged = topLeft.map(composeRenotation);

}
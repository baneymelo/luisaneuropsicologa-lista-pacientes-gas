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
    const match = notation.match(/([A-Z]+)(\d+)/); // "A1" -> [ "A", "1"]
    const row = parseInt(match[2], 10)
    const column = match[1]
    return [row, column]
}

const redifineA1Notation = (arr: Array<string, number>) => `${arr.at(0)}${arr.at(1)-1}`

const getDiffFromPrevious = (actual, previous) => {
    const [_, actualRow] = separeteA1Notation(actual);
    const [__, previousRow] = separeteA1Notation(previous);
    return actualRow - previousRow;
}
const recursiveFilterNotations = (row, idx, acc = []) => {
    if(idx === row.length){
        return acc;
    }
    if(idx === 0){
        acc.push(row.at(idx));
        return recursiveFilterNotations(row, idx + 1, acc);
    }
    const diff = getDiffFromPrevious(row.at(idx), acc.at(acc.length - 1));
    if(diff === 0 || diff > 3) { // spreadsheet format dependency: TOTAL ATENCIONES wanted is 3 rows below TOTAL SESIONES unwanted
        acc.push(row.at(idx));
    }
    return recursiveFilterNotations(row, idx + 1, acc);
}

const filterByIdx = (arr, idx) => arr[idx]
const curryFilterByIdx = (fun) => (idx) => (arr) => fun(arr, idx);

const getBottomRight = (topRight, bottomLeft) => {
    const filterColumns = curryFilterByIdx(filterByIdx)(0);
    const columns = topRight.map(separeteA1Notation);
    const cs = columns.map(filterColumns);

    const filterRows = curryFilterByIdx(filterByIdx)(1);
    const rows = bottomLeft.map(separeteA1Notation);
    const rs = rows.map(filterRows);

    const r = cs.map((c, idx) => c + rs[idx]);
    return r
}

const setA1Notation = (tl, br) => {
    const formatCallback = (tl, idx) => tl + ":" + br.at(idx)
    return tl.map(formatCallback);
};



const listadoPacientes = () => {
    const spreadsSheetId = "1ZTgWI7qjW31vuiML2ODSX0FQuo-mtQ-L0-Vd7eLw2kw";
    const sheetName = "INPUT";
    const topLeftHeader = "HORA";
    const limits = ["HORA", "TOTAL SESIONES", "TOTAL ATENCIONES"];
    const headers = ["NOMBRE", "DOCUMENTO", "TOTAL SESIONES"];
    const sheetData = spreadsSheetProcessor(spreadsSheetId, sheetName, topLeftHeader, limits, headers, utils);
    const textProps = {
        headingTitle: "LISTADO DE PACIENTES"
    }
    /*sheetData.table.unshift(tableHeadings);
    const doc = documentProcessor(sheetData, textProps);
    gmailProcessor(doc);*/
}

const updateNotations = ([col, row], notation) => {
    const a1Notation = notation.split(":");
}

const spreadsSheetProcessor = (spreadsSheetId: string,
                               sheetName: string,
                               topLeftHeader: string,
                               limits: string,
                               headers: string,
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
    const getAllOccurrences = (header: string) => {
        const textFinder = ss.createTextFinder(header).matchEntireCell(true);
        return textFinder.findAll()
    };

    const composeNotation = (header) => composeCallback(
        getA1Notation,
        getAllOccurrences
    )(header)
    /*
        const composeRenotation = (notation) => composeCallback(
            redifineA1Notation,
            separeteA1Notation
        )(notation)

        const headingNotations = limits.map(composeNotation);
        const topLeft = headingNotations.at(0).map(composeRenotation);
        const topRight = headingNotations.at(1);
        const bottomLeftFilterless = headingNotations.at(2).map(composeRenotation);
        const bottomLeft = recursiveFilterNotations(bottomLeftFilterless, 0, []);
        const bottomRight = getBottomRight(topRight, bottomLeft);
        const a1Notation = setA1Notation(topLeft, bottomRight);

        // --
        // validate if sum of the TOTAL SESIONES is > than 0
        // create a filter where the TOTAL SESIONES is > 0
        // filter by headers

        const validateRange = (range) => {

            const cell = ss.getSheetByName(sheetName).getRange(range);
            const isValid = cell.getValue() > 0;
            return isValid
        }

        /!*const cell = ss.getSheetByName(sheetName).getRange("K52");
        cell.setFormula("=SUM(K7:K51)")
        console.log(cell.getValues())*!/
        const range = ss.getRange(a1Notation[0]);
        const lr = range.getLastRow();
        const lc = range.getLastColumn();
        const cell = ss.getDataRange().getCell(lr + 1, lc);
        console.log(cell.getA1Notation())
        cell.setFormula("=SUM(K7:K51)")
        console.log(cell.getValue())*/

    //const k52 = cell.getNextDataCell(SpreadsheetApp.Direction.DOWN).getA1Notation() to move to the next cell with data

    const getDataRegionNotation = (notation) => ss.getRange(notation).getDataRegion().getA1Notation();

    const separateDate = (notation) => {
        //console.log(notation)
        const [date, bottomRight] = notation.split(":");
        const [row, __] = separeteA1Notation(date);
        const range = ss.getRange(date);
        const column = range.getColumn();
        const horaNotation = ss.getDataRange().getCell(row + 1, column).getA1Notation();
        //const dataRegionNotation = ss.getRange(horaNotation).getDataRegion(SpreadsheetApp.Dimension.COLUMNS).getA1Notation();
        const brRange = ss.getRange(bottomRight);
        const brRow = brRange.getRow();
        const brColumn = brRange.getColumn();
        const brNotation = ss.getDataRange().getCell(brRow + 1, brColumn).getA1Notation();
        const dataRegionNotation = horaNotation + ":" + brNotation;
        return [date, dataRegionNotation]
    }

    const getSumFormulaNotationCell: Array<Range[], string> = (notation: string[][]) => {
        const [_, rangeNotation] = notation;
        const [_, sumFormulaNotation] = rangeNotation.split(":");
        const cell = ss.getRange(sumFormulaNotation);
        return [cell, rangeNotation, notation]
    }

    const getTotalSesionesNotationRange = (cellNotation: Array<Range[], string, string[][]>) => {
        const [cell, sumNotationCell, notation] = cellNotation;
        const [horaNotation, sumFormulaNotation] = sumNotationCell.split(":");
        const headersRangeNotation = ss.getRange(horaNotation).getDataRegion(SpreadsheetApp.Dimension.COLUMNS).getA1Notation();
        const [_, totalSesionesNotation] = headersRangeNotation.split(":");
        const sumFormulaRange = ss.getRange(sumFormulaNotation);
        const sumFormulaRow = sumFormulaRange.getRow();
        const sumFormulaColumn = sumFormulaRange.getColumn();
        const upperLimitSumFormula = ss.getDataRange().getCell(sumFormulaRow - 1, sumFormulaColumn).getA1Notation();
        const totalSesionesNotationRange = totalSesionesNotation + ":" + upperLimitSumFormula;
        return [cell, totalSesionesNotationRange, notation]
    }

    const isValidTable = (cellSumFormulaRangeNotation: Array<Range[], string, string[][]>) => {
        const [cell, sumFormulaRangeNotation, notation] = cellSumFormulaRangeNotation
        const range = cell.setFormula(`=SUM(${sumFormulaRangeNotation})`);
        const value = range.getValue();
        cell.setValue("");
        return value > 0 ? notation : [];
    }

    const setFilter = (notation) => { // looks like doesnt works as expected
        const range = ss.getRange(notation);
        const filter = range.createFilter();
        const column = range.getLastColumn();
        const criteria = SpreadsheetApp.newFilterCriteria().whenNumberGreaterThan(0).build()
        filter.setColumnFilterCriteria(column, criteria);
    }

    const composeValidTable = (notations) => composeCallback(
        isValidTable,
        getTotalSesionesNotationRange,
        getSumFormulaNotationCell
    )(notations)

    const topLeftNotations = composeNotation(topLeftHeader);
    const dataRegionsNotations = topLeftNotations.map(getDataRegionNotation);
    const dateAndNotation = dataRegionsNotations.map(separateDate);
    const dateAndNotationValid = dateAndNotation.map(composeValidTable);
    console.log(dateAndNotationValid)
    //console.log(dateAndNotation.at(0).at(1))
    //setFilter(dateAndNotation.at(0).at(1));

    //const _ = ss.getRange(dateAndNotation.at(0).at(1)).getValues();
    //console.log(_)


    //const newDataRegionsNotations = setFilter(dataRegionsNotations.at(0))
    //console.log(newDataRegionsNotations)
    /*console.log(
        ss.getRange(topLeftNotation)
            .getDataRegion()
            .getA1Notation()
    );*/
    /*const r = ss.getDataRange();
    //console.log(r.getValues());
    const n = r.getCell(5, 14).getA1Notation();
    console.log(n);*/


    /*const range = ss.getRange(a1Notation[0])
    const values = range.getValues();
    console.log(values)*/

}


/*
 FUNCTIONS
setNumberFormat(numberFormat) -> to set date format
getCell(row, column) -> to go to a specific cell
getColumn(), getRow() -> to get the position
getDataRegion(SpreadsheetApp.Dimension.ROWS) -> range of data
*/

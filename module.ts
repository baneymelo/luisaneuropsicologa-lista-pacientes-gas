
namespace Module {

    export const transpose = (data: Array<Array<string>>): Array<Array<string>> => (
        data.reduce((prev, next) =>
            next.map((item, i) =>
                (prev[i] || []).concat(next[i])
            ), [])
    )

    export const getDataRange = (ranges: Array<Array<string>>, positions: Array<Array<number>>) => {
        return ranges.reduce((data, row, idx) => {
            if(idx === 0) {
                data.push(row.at(0));
                return data
            }
            if(idx === 1) return data;
            const mapped = positions.map((postition, idx) => row.at(postition));
            mapped.forEach(m => data.push(m))
            return data;
        }, [])
    }

    export const getRange = (values: Array<Array<string>>, positions: Array<Array<number>>) => {
        const upperY = positions.at(0) - 1;
        const lowerY = positions.at(1) - 1;
        const prevRange = values.slice(upperY);
        const range = prevRange.slice(0, lowerY - upperY);
        return range;
    }

    type HeadingPositions = { count: number, x: Array<Array<string>>, y: Array<Array<string>> }
    type HeadingXY = {
        nombre: HeadingPositions,
        documento: HeadingPositions,
        fechadeagendamiento: HeadingPositions,
        totalsesiones: HeadingPositions
    }

    export const getHeaderXY = (data: Array<Array<string>>, headerToLookFor: string | Date) => {
            return data.reduce((acc, row) => {
                acc.count++;
                const accRow = recursiveBase(headerToLookFor, 0, row, []);
                if(accRow.length !== 0) {
                    acc.x.push([...accRow]);
                    acc.y.push([acc.count - 1]);
                }
                return acc;
            }, { count: 0, x: [], y: [] })
    }

    const recursiveBase = (headerToLookFor, idx, row, acc) => {
        const i = row.indexOf(headerToLookFor, idx);
        if(i !== -1) {
            acc.push(i);
            return recursiveBase(headerToLookFor, i + 1, row, acc);
        }
        return acc;
    }

    export type Patient = string[];

    export const getInputSheet: SpreadSheet = (id: string, sheetName: string) => {
               const ss: SpreadsheetApp = SpreadsheetApp.openById(id);
               const inputSheet: Sheet = ss.getSheetByName(sheetName);
               return inputSheet.getParent();
    }

    export const getDataValues: Ranges  = (ss: SpreadSheet) => {
        const ranges = ss.getDataRange();
        return ranges.getValues();
    }

    /*export const getTotalTables = (values: string[]) => {
        const totalTables = values.filter(curRow => curRow[])
        return totalTables;
    }*/

    export const getDates = (sheet, range) => {
        return sheet.getRange(range)
            .getValues()
            .flat()
            .filter(value => value !== '');
    }

    export const getPatientsByDay = (sheet: Sheet, dayRange: string): string[][] => (
        sheet.getRange(dayRange)
            .getValues()
    );

    const parseDateToString = (date: Date) => {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Enero es 0
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    }

    export const getPatients = (fortnightlyRanges: String[][], inputSheet: Sheet) => (
       fortnightlyRanges.flat().reduce((patients, curRangeDay) => {
           const patientsByDay = Module.getPatientsByDay(patients.sheet, curRangeDay);
           patients.data.push(patientsByDay);
           return patients;
       }, {sheet: inputSheet, data: []})
    )

    const depureDayBySessions = (data: Patient[]) => data.reduce((patientsDay, currPatientDay, idx) => {
        const totalSessionsByDay = currPatientDay.map((patientRow, idx) => idx >= 2 ? patientRow[8] : 0)
        const sessionsExist = totalSessionsByDay.some(sessionValue => sessionValue === 1);
        if(sessionsExist){
            patientsDay.push(currPatientDay);
        }
        return patientsDay;
    },[])

    const depureByColumns = (data: Patient[]) => data.map(
       patientsData => patientsData.map(
           patient => [patient[1], patient[2], patient[8], patient[9]])
    );

    const  depureWithSessions = (data: Patient[]) => (
       data.map(patientByDay => patientByDay.filter(patient => patient[2] === 1))
    )

    const replaceHourByDate = (data: Patient[]) => data.map(patientsDay => {
        const date = patientsDay[0][0];
        const dateString = parseDateToString(date);
        return patientsDay.map(patient => {
            patient.push(dateString);
            return patient;
        })
    })

    const groupByDocument = (data: Patient[]) => {
        const patientsDocumentsGroup = data.flat().map(patientDay => patientDay[1])
        const patientsDocuments = Array.from(new Set(patientsDocumentsGroup));
        const patients = [];
        for (let document of patientsDocuments) {
            const patientsByDocument = data.flat().filter(patient => patient[1] === document);
            const sessions = patientsByDocument.length;
            const datesArray = patientsByDocument.map(patient => patient[3]);
            const dates = datesArray.join('\n');
            const patient = [patientsByDocument[0][0], document, sessions, dates];
            patients.push(patient);
        }
        return patients;
    }

    const valuesToString = (patients: Patient[]) => (
        patients
            .map(patient => [patient[0], patient[1].toString(), patient[2].toString(), patient[3]])
    );

    export const depureData = (data: Patient[]) => {
        const patientsWithDaySessions = depureDayBySessions(data);
        const patientsWithDates = replaceHourByDate(patientsWithDaySessions);
        const patientsFilteredByColumns = depureByColumns(patientsWithDates);
        const patientsWithSessions = depureWithSessions(patientsFilteredByColumns);
        const patientsGroupByDocument = groupByDocument(patientsWithSessions);
        const patientValuesToString = valuesToString(patientsGroupByDocument)
        return patientValuesToString;
    };

    export const createDocument = (name: string) => DocumentApp.create(name);

    const getTotalPatientsRange = (sheet: Sheet, textToFind: string) => {
        const textFinder = sheet.createTextFinder(textToFind);
        const totalPatients = textFinder.findAll();
        return totalPatients;
    }

    const mergeNotations = (tl: string[], br: string[]) => (
        tl.reduce((acc, curr, index) => {
            acc.push(`${curr}:${br[index]}`);
            return acc;
        }, []));

    const getNotation = (sheet: Sheet, ranges: string[]) => ranges.map(range => sheet.getRange(range[0], range[1]).getA1Notation());

    export const fortnightlyNotationsBuilder = (sheet: Sheet, textToFind: string) => {
        const totalPatientsRange = getTotalPatientsRange(sheet, textToFind);
        const bottomRightRanges = totalPatientsRange.map(totalPatientRange => [totalPatientRange.getRow(), totalPatientRange.getColumn() + 8]);
        const topLeftRanges = totalPatientsRange.map(totalPatientRange => [totalPatientRange.getRow() - 25, totalPatientRange.getColumn()]);
        const topLeftNotation = getNotation(sheet, topLeftRanges);
        const bottomRightNotation = getNotation(sheet, bottomRightRanges);
        const notations = mergeNotations(topLeftNotation, bottomRightNotation);
        return notations;
    }

    export const getNameDocument = (sheet: Sheet, startDateNotation: string, endDateNotation: string) => {
        const startColonIndex = startDateNotation.indexOf(":");
        const endColonIndex = endDateNotation.indexOf(":");
        const startDateNotationRight: string = startDateNotation.slice(0, startColonIndex);
        const endDateNotationLeft: string = endDateNotation.slice(0, endColonIndex);
        const startDate: string = sheet.getRange(startDateNotationRight).getValue();
        const endDate: string = sheet.getRange(endDateNotationLeft).getValue();
        const documentname: string = `Listado de pacientes [${parseDateToString(startDate)}] - (${parseDateToString(endDate)})]`
        return documentname;
    }

    interface IDriveBuilder {
        builder: () => DriveBuilder;
        build: () => Drive;
    }

    export class DriveBuilder implements IDriveBuilder {
        private driveApp: DriveApp;
        private id: string;

        builder(): DriveBuilder {
            return new DriveBuilder();
        }

        getDriveApp = (): DriveApp => {
            return this.driveApp;
        }

        setDriveApp = (driveApp: DriveApp): DriveBuilder => {
            this.driverApp = driveApp;
            return this;
        }

        setId = (id: string): void => {

        }

        build(): Drive {
            return new Drive(this);
        }

    }

    interface IDrive {
        download: () => void;
    }

    export class Drive implements IDrive {
        private file: Drive;

        constructor(private driveBuilder: DriveBuilder) {
            this.file = driveBuilder.driveApp.getFileById(driveBuilder.getId);
        }

        download(): void {
            return this.file.getDownloadUrl();
        }
    }
}




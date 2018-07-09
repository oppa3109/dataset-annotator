import {CoordinatesObject} from "../objects/CoordinatesObject";
import {Drawer} from "./drawer";
import {AnnotationsProvider, Line} from "../providers/annotations/annotations";


const MIN_LINE_LENGTH = 10;
const POINT_RADIUS = 5;

const DEFAULT_COLOR = 'red';
const SELECTED_COLOR = 'yellow';

export class LineDrawer extends Drawer{
    private lines: Line[] = [];

    constructor(context: CanvasRenderingContext2D,
                annotationsProvider: AnnotationsProvider) {
        super(context, annotationsProvider);
        this.lines = this.getAnnotationsProvider().getLines(); // Reference!
    }

    saveFromCoordinates(start: CoordinatesObject, end: CoordinatesObject) {
        let line = LineDrawer.getLineFromCoordinates(start, end);
        this.saveLine(line)
    }

    drawFromCoordinates(start: CoordinatesObject, end: CoordinatesObject){
        let line = LineDrawer.getLineFromCoordinates(start, end);
        this.drawLine(line);
    }

    saveLine(line: Line){
        if (LineDrawer.computeLineLength(line) > MIN_LINE_LENGTH){
            this.getAnnotationsProvider().addLine(line);
            this.drawLine(line);
        }
    }

    drawLine(line: Line){
        if (LineDrawer.computeLineLength(line) < MIN_LINE_LENGTH){
            return;
        }

        let color = line == Drawer.getSelectedElement() ? SELECTED_COLOR : DEFAULT_COLOR;

        this.drawCircle(line.x1, line.y1, color);
        super.getContext().beginPath();
        super.getContext().moveTo(line.x1, line.y1);
        super.getContext().lineTo(line.x2, line.y2);
        super.getContext().strokeStyle = color;
        super.getContext().stroke();
        this.drawCircle(line.x2, line.y2, color);
    }

    drawCircle(x: number, y: number, color = DEFAULT_COLOR){
        super.getContext().beginPath();
        super.getContext().fillStyle = color;
        super.getContext().arc(x, y, POINT_RADIUS, 0, 2 * Math.PI);
        super.getContext().fill();
        super.getContext().stroke();
    }

    static computeLineLength(line: Line){
        return Math.sqrt(Math.pow(line.x2 - line.x1, 2) + Math.pow(line.y2 - line.y1, 2));
    }

    render(){
        this.renderLines(this.lines);
    }

    renderLines(lines: Line[]){
        for(let line of lines){
            this.drawLine(line);
        }
    }

    static isNearCoordinates(line: Line, coordinates: CoordinatesObject): boolean{
        let distanceFromPoint1 = LineDrawer.computeLineLength({
            x1: line.x1,
            y1: line.y1,
            x2: coordinates.x,
            y2: coordinates.y
        } as Line);

        let distanceFromPoint2 = LineDrawer.computeLineLength({
            x1: line.x2,
            y1: line.y2,
            x2: coordinates.x,
            y2: coordinates.y
        } as Line);

        return distanceFromPoint1 <= POINT_RADIUS || distanceFromPoint2 <= POINT_RADIUS;
    }

    isHovering(coordinates: CoordinatesObject): boolean {
        let hoveringOnLine = false;
        for(let line of this.lines){
            if (LineDrawer.isNearCoordinates(line, coordinates)){
                hoveringOnLine = true;
            }
        }
        return hoveringOnLine;
    }


    static getLineFromCoordinates(start: CoordinatesObject, end: CoordinatesObject): Line {
        return {
            x1: start.x,
            y1: start.y,
            x2: end.x,
            y2: end.y
        } as Line
    }

    selectElement(location: CoordinatesObject) : boolean {
        for (let line of this.lines) {
            if (LineDrawer.isNearCoordinates(line, location)) {
                Drawer.setSelectedElement(line);
                return true;
            }
        }
        return false;
    }

}

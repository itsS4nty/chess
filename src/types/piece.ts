import { PiecesEnum } from "../enums/pieces";

type PieceColor = 'white' | 'black';
type PieceTypeName = 'king' | 'queen' | 'rook' | 'bishop' | 'knight' | 'pawn' | 'bullet';
export type PieceType = {
    row?: number;
    column?: number;
    color?: PieceColor;
    type?: PieceTypeName;
    isPossibleMove?: boolean;
    pawnFirstDoubleMove?: boolean;
};
export type PiecesType = Record<string, PieceType>;
export type SquarePosition = {
    row: number,
    column: number
}
export type PossibleMoves = {
    row: number,
    column: number,
    pawnFirstDoubleMove?: boolean
}
export type PossibleMovesType = {
    piece: PiecesEnum,
    moves: PossibleMoves[]
};
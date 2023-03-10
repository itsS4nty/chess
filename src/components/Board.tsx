import React, { useState } from 'react';
import styled from 'styled-components';
import { PiecesEnum } from '../enums/pieces';
import { Turn } from '../enums/turn';
import { PiecesType, PieceType, PossibleMoves, PossibleMovesType } from '../types/piece';
import { getCalculationNumber } from '../utils/chess';
import Square from './Square';

const Container = styled.div`
	height: 100%;
	width: 100%;
	display: flex;
	flex-wrap: wrap;
`;

const Board = () => {
	const [totalRows] = useState(Array.from(Array(8).keys()));
	const [totalColumns] = useState(Array.from(Array(8).keys()));
	const [pieces, setPieces] = useState<PiecesType>({
        '0-0': { row: 0, column: 0, color: Turn.BLACK, type: PiecesEnum.ROOK },
        '0-1': { row: 0, column: 1, color: Turn.BLACK, type: PiecesEnum.KNIGHT },
        '0-2': { row: 0, column: 2, color: Turn.BLACK, type: PiecesEnum.BISHOP },
        '0-3': { row: 0, column: 3, color: Turn.BLACK, type: PiecesEnum.QUEEN },
        '0-4': { row: 0, column: 4, color: Turn.BLACK, type: PiecesEnum.KING },
        '0-5': { row: 0, column: 5, color: Turn.BLACK, type: PiecesEnum.BISHOP },
        '0-6': { row: 0, column: 6, color: Turn.BLACK, type: PiecesEnum.KNIGHT },
        '0-7': { row: 0, column: 7, color: Turn.BLACK, type: PiecesEnum.ROOK },
        '1-0': { row: 1, column: 0, color: Turn.BLACK, type: PiecesEnum.PAWN },
        '1-1': { row: 1, column: 1, color: Turn.BLACK, type: PiecesEnum.PAWN },
        '1-2': { row: 1, column: 2, color: Turn.BLACK, type: PiecesEnum.PAWN },
        '1-3': { row: 1, column: 3, color: Turn.BLACK, type: PiecesEnum.PAWN },
        '1-4': { row: 1, column: 4, color: Turn.BLACK, type: PiecesEnum.PAWN },
        '1-5': { row: 1, column: 5, color: Turn.BLACK, type: PiecesEnum.PAWN },
        '1-6': { row: 1, column: 6, color: Turn.BLACK, type: PiecesEnum.PAWN },
        '1-7': { row: 1, column: 7, color: Turn.BLACK, type: PiecesEnum.PAWN },
        '6-0': { row: 6, column: 0, color: Turn.WHITE, type: PiecesEnum.PAWN },
        '6-1': { row: 6, column: 1, color: Turn.WHITE, type: PiecesEnum.PAWN },
        '6-2': { row: 6, column: 2, color: Turn.WHITE, type: PiecesEnum.PAWN },
        '6-3': { row: 6, column: 3, color: Turn.WHITE, type: PiecesEnum.PAWN },
        '6-4': { row: 6, column: 4, color: Turn.WHITE, type: PiecesEnum.PAWN },
        '6-5': { row: 6, column: 5, color: Turn.WHITE, type: PiecesEnum.PAWN },
        '6-6': { row: 6, column: 6, color: Turn.WHITE, type: PiecesEnum.PAWN },
        '6-7': { row: 6, column: 7, color: Turn.WHITE, type: PiecesEnum.PAWN },
        '7-0': { row: 7, column: 0, color: Turn.WHITE, type: PiecesEnum.ROOK },
		'7-1': { row: 7, column: 1, color: Turn.WHITE, type: PiecesEnum.KNIGHT },
        '7-2': { row: 7, column: 2, color: Turn.WHITE, type: PiecesEnum.BISHOP },
        '7-3': { row: 7, column: 3, color: Turn.WHITE, type: PiecesEnum.QUEEN },
        '7-4': { row: 7, column: 4, color: Turn.WHITE, type: PiecesEnum.KING },
        '7-5': { row: 7, column: 5, color: Turn.WHITE, type: PiecesEnum.BISHOP },
        '7-6': { row: 7, column: 6, color: Turn.WHITE, type: PiecesEnum.KNIGHT },
        '7-7': { row: 7, column: 7, color: Turn.WHITE, type: PiecesEnum.ROOK }
    });
    const [selectedRow, setSelectedRow] = useState<number | null>(null);
    const [selectedColumn, setSelectedColumn] = useState<number | null>(null);
    const [turn, setTurn] = useState<Turn>(Turn.WHITE);

    const handleOnClick = (row: number, column: number) => {
        // Check if the clicked piece is yours
        if(getConcretePiece(row, column).color !== turn && selectedColumn === null && selectedRow === null) return;
        // Can't use (!selectedRow || !selectedColumn) because if we
        // click on row or column 0 it'll never work
        // as it'll detects it as falsy
        let newPieces = {...pieces};
        if(selectedRow === null || selectedColumn === null) {
            let possible_moves = getPossibleMoves(row, column)?.moves;
            if(!possible_moves || !possible_moves.length) return;
            setSelectedRow(row);
            setSelectedColumn(column);
            possible_moves.forEach(move => {
                if(newPieces[`${move.row}-${move.column}`]) {
                    newPieces[`${move.row}-${move.column}`].isPossibleMove = true;
                    return;
                }
                newPieces[`${move.row}-${move.column}`] = { type: PiecesEnum.BULLET, isPossibleMove: true, pawnFirstDoubleMove: move.pawnFirstDoubleMove }
            });
            setPieces(newPieces)
            return;
        }
        const piece = getConcretePiece(row, column);
        if(!piece || !piece.isPossibleMove) return;
        newPieces[`${row}-${column}`] = pieces[`${selectedRow}-${selectedColumn}`];
        newPieces[`${row}-${column}`].row = row;
        newPieces[`${row}-${column}`].column = column;

        if(newPieces[`${selectedRow}-${selectedColumn}`].type === PiecesEnum.PAWN) {
            newPieces[`${row}-${column}`] = handlePawnMove(newPieces[`${selectedRow}-${selectedColumn}`], piece);
            let specialMove = handleSpecialPawnMove(row, column);
            if(specialMove)
                delete newPieces[specialMove];

            newPieces = Object.fromEntries(Object.entries(newPieces).map(([key, value]) => {
                if(value.color !== turn)
                    value.pawnFirstDoubleMove = false;
    
                return [key, value];
            }));
        }

        newPieces = Object.fromEntries(Object.entries(newPieces).filter(([, value]) => {
            if(value.type === PiecesEnum.BULLET) return false;
            value.isPossibleMove = false;
            return true;
        }));
      
        delete newPieces[`${selectedRow}-${selectedColumn}`];
        setPieces(newPieces);
        setSelectedColumn(null);
        setSelectedRow(null);
        isCheck(newPieces);
        handleTurns();
    }
    
    const getPossibleMoves = (row: number, column: number, new_pieces = null) => {
        const { type } = new_pieces ? new_pieces[`${row}-${column}`] : pieces[`${row}-${column}`];
        switch(type) {
            case PiecesEnum.PAWN:
                return getPawnMoves(row, column);
            case PiecesEnum.KNIGHT:
                return getKnightMoves(row, column);
            case PiecesEnum.BISHOP:
                return getBishopMoves(row, column);
            case PiecesEnum.ROOK:
                return getRookMoves(row, column);
            case PiecesEnum.QUEEN:
                return getQueenMoves(row, column);
            case PiecesEnum.KING:
                return getKingMoves(row, column);
        }
    }

    const getPawnMoves = (row: number, column: number): PossibleMovesType => {
        if(row === null || column === null) return { piece: PiecesEnum.PAWN, moves: [] };
        const negative_numbers = turn === Turn.WHITE;
        let movements = [];
        let first_move = turn === Turn.WHITE ? row === 6 : row === 1;

        let piece = getConcretePiece(row+getCalculationNumber(2, negative_numbers), column);

        if(first_move && !piece)
            movements.push({ row: row + getCalculationNumber(2, negative_numbers), column: column, pawnFirstDoubleMove: true , piece: PiecesEnum.PAWN});
        
        piece = getConcretePiece(row+getCalculationNumber(1, negative_numbers), column)       
        if(!piece)
            movements.push({ row: row + getCalculationNumber(1, negative_numbers), column: column , piece: PiecesEnum.PAWN});

        piece = getConcretePiece(row+getCalculationNumber(1, negative_numbers), column+getCalculationNumber(1, true));
        let special_piece = getConcretePiece(row, column+getCalculationNumber(1, true));
        if ((piece && piece.color !== turn) || (special_piece && special_piece.color !== turn && special_piece.pawnFirstDoubleMove))
        movements.push({ row: row+getCalculationNumber(1, negative_numbers), column: column+getCalculationNumber(1, true), piece: PiecesEnum.PAWN});
        
        piece = getConcretePiece(row+getCalculationNumber(1, negative_numbers), column+getCalculationNumber(1, false)) 
        special_piece = getConcretePiece(row, column+getCalculationNumber(1, false));    
        if((piece && piece.color !== turn) || (special_piece && special_piece.pawnFirstDoubleMove && special_piece.color !== turn))
            movements.push({ row: row+getCalculationNumber(1, negative_numbers), column: column+getCalculationNumber(1, false), piece: PiecesEnum.PAWN});

        return {
            piece: PiecesEnum.PAWN,
            moves: movements
        };
    }

    const getKnightMoves = (row: number, column: number): PossibleMovesType => {
        if(row === null || column === null) return { piece: PiecesEnum.KNIGHT, moves: [] };
        const negative_numbers = turn === Turn.WHITE;
        let movements = [];
        let possible_moves = [
            { row: 2, column: 1 },
            { row: 2, column: -1 },
            { row: 1, column: 2 },
            { row: 1, column: -2 },
            { row: -1, column: 2 },
            { row: -1, column: -2 },
            { row: -2, column: 1 },
            { row: -2, column: -1 },
        ]

        for(let move of possible_moves) {
            let row_calculation = row + getCalculationNumber(move.row, negative_numbers);
            let column_calculation = column + getCalculationNumber(move.column, negative_numbers);
            if(row_calculation > 7 || row_calculation < 0 || column_calculation > 7 || column_calculation < 0)
                continue;
            
            let piece = getConcretePiece(row_calculation, column_calculation);
            if(!piece || piece.color !== turn)
                movements.push({ row: row_calculation, column: column_calculation, piece: PiecesEnum.KNIGHT });
        }
        return {
            piece: PiecesEnum.KNIGHT,
            moves: movements,
        };
    }

    const getBishopMoves = (row: number, column: number, limit_moves: number = 8): PossibleMovesType => {
        if(row === null || column === null) return { piece: PiecesEnum.BISHOP, moves: [] };
        let movements: PossibleMoves[] = [];
        let stop_up_right = false;
        let stop_up_left = false;
        let stop_down_right = false;
        let stop_down_left = false
        for(let i = 1; i < limit_moves; i++) {
            // Check if it aren't more possible moves
            if(stop_up_right && stop_up_left && stop_down_right && stop_down_left) break;

            // Up right diagonal
            let row_up_right = row - i;
            let col_up_right = column + i;
            let piece_up_right = getConcretePiece(row_up_right, col_up_right);
            if(piece_up_right && piece_up_right.color === turn) stop_up_right = true;
            if((row_up_right >= 0 && col_up_right < 8 && !stop_up_right)) {
                movements.push({ row: row_up_right, column: col_up_right})
            }
            if(piece_up_right && piece_up_right.color !== turn) stop_up_right = true;

            // Up left diagonal
            let row_up_left = row - i;
            let col_up_left = column - i;
            let piece_up_left = getConcretePiece(row_up_left, col_up_left);
            if(piece_up_left && piece_up_left.color === turn) stop_up_left = true;
            if(row_up_left >= 0 && col_up_left >= 0 && !stop_up_left) {
                movements.push({ row: row_up_left, column: col_up_left})
            }
            if(piece_up_left && piece_up_left.color !== turn) stop_up_left = true;

            // Down right diagonal
            let row_down_right = row + i;
            let col_down_right = column + i;
            let piece_down_right = getConcretePiece(row_down_right, col_down_right);
            if(piece_down_right && piece_down_right.color === turn) stop_down_right = true;
            if(row_down_right < 8 && col_down_right < 8 && !stop_down_right) {
                movements.push({ row: row_down_right, column: col_down_right})
            }
            if(piece_down_right && piece_down_right.color !== turn) stop_down_right = true;

            // Down left diagonal
            let row_down_left = row + i;
            let col_down_left = column - i;
            let piece_down_left = getConcretePiece(row_down_left, col_down_left);
            if(piece_down_left && piece_down_left.color === turn) stop_down_left = true;
            if(row_down_left < 8 && col_down_left >= 0 && !stop_down_left) {
                movements.push({ row: row_down_left, column: col_down_left})
            } 
            if(piece_down_left && piece_down_left.color !== turn) stop_down_left = true;
        }

        return {
            piece: PiecesEnum.BISHOP,
            moves: movements,
        };
    }

    const getRookMoves = (row: number, column: number, limit_moves: number = 8): PossibleMovesType => {
        if(row === null || column === null) return { piece: PiecesEnum.ROOK, moves: [] };
        let movements: PossibleMoves[] = [];
        let stop_right = false;
        let stop_left = false;
        let stop_up = false
        let stop_down = false;
        for(let i = 1; i < limit_moves; i++) {
            // Check if it aren't more possible moves
            if(stop_right && stop_left && stop_up && stop_down) break;

            // Right
            let right = column + i;
            let piece_right = getConcretePiece(row, right);
            if(piece_right && piece_right.color === turn) stop_right = true;
            if((row >= 0 && right < 8 && !stop_right)) {
                movements.push({ row: row, column: right})
            }
            if(piece_right && piece_right.color !== turn) stop_right = true;

            // Left
            let left = column - i;
            let piece_up_left = getConcretePiece(row, left);
            if(piece_up_left && piece_up_left.color === turn) stop_left = true;
            if(row >= 0 && left >= 0 && !stop_left) {
                movements.push({ row: row, column: left})
            }
            if(piece_up_left && piece_up_left.color !== turn) stop_left = true;

            // Up
            let up = row - i;
            let piece_down_right = getConcretePiece(up, column);
            if(piece_down_right && piece_down_right.color === turn) stop_up = true;
            if(up < 8 && column < 8 && !stop_up) {
                movements.push({ row: up, column: column})
            }
            if(piece_down_right && piece_down_right.color !== turn) stop_up = true;

            // Down
            let down = row + i;
            let piece_down_left = getConcretePiece(down, column);
            if(piece_down_left && piece_down_left.color === turn) stop_down = true;
            if(down < 8 && column >= 0 && !stop_down) {
                movements.push({ row: down, column: column})
            } 
            if(piece_down_left && piece_down_left.color !== turn) stop_down = true;
        }
        
        return {
            piece: PiecesEnum.ROOK,
            moves: movements,
        };
    }

    const getQueenMoves = (row: number, column: number): PossibleMovesType => {
        if(row === null || column === null) return { piece: PiecesEnum.QUEEN, moves: [] };
        return {
            piece: PiecesEnum.QUEEN,
            moves: [getBishopMoves(row, column).moves, getRookMoves(row, column).moves].flat()
        };
    }

    const getKingMoves = (row: number, column: number): PossibleMovesType => {
        if(row === null || column === null) return { piece: PiecesEnum.KING, moves: [] };
        return {
            piece: PiecesEnum.KING,
            moves: [getBishopMoves(row, column, 2).moves, getRookMoves(row, column, 2).moves].flat()
        };
    }

    const isCheck = (_newPieces: PiecesType) => {
        const king_obj = Object.entries(pieces).find(([, value]) => value.color !== turn && value.type === PiecesEnum.KING);
        if(!king_obj) return;
        const [, king] = king_obj;
        const movements = getAllMovements(_newPieces);
        if(!movements.length) return;
        let checks: any = [];
        for(let move of movements) {
            if(!move || !move.moves) continue;
            if(move.moves.filter(m => m && m.row === king.row && m.column === king.column).length) {
                checks.push({
                    piece: move.piece,
                    origin_row: move.origin_row,
                    origin_column: move.origin_column
                })
            }
        }
        return {
            check: checks.length > 0,
            checks
        }
    }

    const getAllMovements = (_newPieces: PiecesType) => {
        let _pieces = Object.entries(_newPieces).map(([key, value]) => {
            if(value.color !== turn) return [false, false];
            return [key, value];
        }).filter(p => !p.includes(false));
        const values = _pieces.map(u => u[1])
        if(!values || !values.length) return [];
        let movements = [];
        for(let piece of values) {
            piece = piece as PieceType;
            //@ts-ignore
            // if(!piece || !piece.row || !piece.column) continue;
            //@ts-ignore
            const moves = getPossibleMoves(piece.row, piece.column, _newPieces);
            //@ts-ignore
            movements.push({
                piece: moves?.piece,
                moves: moves?.moves,
                origin_row: piece.row,
                origin_column: piece.column
            })
        }
        return movements;
    }

    const handlePawnMove = (newPiece: PieceType, clickPiece: PieceType) => {
        if(clickPiece.pawnFirstDoubleMove)
            newPiece.pawnFirstDoubleMove = true;

        return newPiece;
    }

    const handleSpecialPawnMove = (row: number, column: number) => {
        let piece = getConcretePiece(row + getCalculationNumber(1, turn === Turn.BLACK), column);
        if(piece)
            return `${row + getCalculationNumber(1, turn === Turn.BLACK)}-${column}`;
    }
 
    const handleTurns = () => {
        setTurn(turn === Turn.WHITE ? Turn.BLACK : Turn.WHITE);
    }

    const getConcretePiece = (row: number, column: number) => pieces[`${row}-${column}`]

	return (
		<Container>
			{totalRows.map((column, column_index) => (
				<div key={column}>
					{totalColumns.map((row, row_index) => (
						<Square
							key={row}
							even={
								row_index % 2 === 0
									? column_index % 2 === 0
									: column_index % 2 !== 0
							}
							piece={pieces[`${row_index}-${column_index}`]}
                            onClick={() => handleOnClick(row_index, column_index)}
						/>
					))}
				</div>
			))}
		</Container>
	);
};

export default Board;

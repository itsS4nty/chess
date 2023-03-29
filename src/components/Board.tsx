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
    const [check, setCheck] = useState<boolean>(false);
    const [checkAttacks, setCheckAttacks] = useState<any>([]);

    const handleOnClick = (row: number, column: number) => {
        // Check if click on empty space
        if(!getConcretePiece(row, column)) {
            setPieces(Object.fromEntries(Object.entries(pieces).filter(([, value]) => {
                if(value.type === PiecesEnum.BULLET) return false;
                value.isPossibleMove = false;
                return true;
            })));
            setSelectedRow(null);
            setSelectedColumn(null);
            return;
        };
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
        const check_data = isCheck(newPieces);
        setCheck(false);
        if(check_data && check_data.check) {
            setCheck(true);
            setCheckAttacks(check_data.checks);
        }
        handleTurns();
    }
    
    const getPossibleMoves = (row: number, column: number, new_pieces: PiecesType | null = null, checkLegalMoves = true) => {
        const { type } = new_pieces ? new_pieces[`${row}-${column}`] : pieces[`${row}-${column}`];
        switch(type) {
            case PiecesEnum.PAWN:
                return getPawnMoves(row, column, checkLegalMoves, new_pieces);
            case PiecesEnum.KNIGHT:
                return getKnightMoves(row, column, checkLegalMoves, new_pieces);
            case PiecesEnum.BISHOP:
                return getBishopMoves(row, column, checkLegalMoves, new_pieces);
            case PiecesEnum.ROOK:
                return getRookMoves(row, column, checkLegalMoves, new_pieces);
            case PiecesEnum.QUEEN:
                return getQueenMoves(row, column, checkLegalMoves);
            case PiecesEnum.KING:
                return getKingMoves(row, column, checkLegalMoves);
        }
    }

    const getPawnMoves = (row: number, column: number, checkLegalMoves: boolean, tempPieces: PiecesType | null = null): PossibleMovesType => {
        if(row === null || column === null) return { piece: PiecesEnum.PAWN, moves: [] };
        const negative_numbers = turn === Turn.WHITE;
        let movements = [];
        let first_move = turn === Turn.WHITE ? row === 6 : row === 1;

        let piece = getConcretePiece(row+getCalculationNumber(2, negative_numbers), column, tempPieces);

        if(first_move && !piece) {
            const move = { row: row + getCalculationNumber(2, negative_numbers), column: column, pawnFirstDoubleMove: true , piece: PiecesEnum.PAWN};
            if(checkLegalMoves && isLegalMove(move, row, column))
                movements.push(move);
            else
                movements.push(move)
        }
        
        piece = getConcretePiece(row+getCalculationNumber(1, negative_numbers), column, tempPieces);
        if(!piece) {
            const move = { row: row + getCalculationNumber(1, negative_numbers), column: column , piece: PiecesEnum.PAWN};
            if(checkLegalMoves && isLegalMove(move, row, column))
                movements.push(move);
            else
                movements.push(move)
        }

        piece = getConcretePiece(row+getCalculationNumber(1, negative_numbers), column+getCalculationNumber(1, true), tempPieces);
        let special_piece = getConcretePiece(row, column+getCalculationNumber(1, true), tempPieces);
        if ((piece && piece.color !== turn) || (special_piece && special_piece.color !== turn && special_piece.pawnFirstDoubleMove)) {
            const move = { row: row+getCalculationNumber(1, negative_numbers), column: column+getCalculationNumber(1, true), piece: PiecesEnum.PAWN};
            if(checkLegalMoves && isLegalMove(move, row, column))
                movements.push(move);
            else
                movements.push(move)
        }
        
        piece = getConcretePiece(row+getCalculationNumber(1, negative_numbers), column+getCalculationNumber(1, false), tempPieces);
        special_piece = getConcretePiece(row, column+getCalculationNumber(1, false), tempPieces);
        if((piece && piece.color !== turn) || (special_piece && special_piece.pawnFirstDoubleMove && special_piece.color !== turn)) {
            const move = { row: row+getCalculationNumber(1, negative_numbers), column: column+getCalculationNumber(1, false), piece: PiecesEnum.PAWN};
            if(checkLegalMoves && isLegalMove(move, row, column))
                movements.push(move);
            else
                movements.push(move)
        }

        return {
            piece: PiecesEnum.PAWN,
            moves: movements
        };
    }

    const getKnightMoves = (row: number, column: number, checkLegalMoves: boolean, tempPieces: PiecesType | null = null): PossibleMovesType => {
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
            
            let piece = getConcretePiece(row_calculation, column_calculation, tempPieces);
            if(!piece || piece.color !== turn) {
                const move = { row: row_calculation, column: column_calculation, piece: PiecesEnum.KNIGHT }
                if(checkLegalMoves && isLegalMove(move, row, column))
                    movements.push(move);
                else
                    movements.push(move)
            }
        }
        return {
            piece: PiecesEnum.KNIGHT,
            moves: movements,
        };
    }

    const getBishopMoves = (row: number, column: number, checkLegalMoves: boolean, tempPieces: PiecesType | null = null, limit_moves: number = 8): PossibleMovesType => {
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
            let piece_up_right = getConcretePiece(row_up_right, col_up_right, tempPieces);
            if(piece_up_right && piece_up_right.color === turn) stop_up_right = true;
            if((row_up_right >= 0 && col_up_right < 8 && !stop_up_right)) {
                const move = { row: row_up_right, column: col_up_right};
                if(checkLegalMoves && isLegalMove(move, row, column))
                    movements.push(move)
                else
                    movements.push(move)
            }
            if(piece_up_right && piece_up_right.color !== turn) stop_up_right = true;

            // Up left diagonal
            let row_up_left = row - i;
            let col_up_left = column - i;
            let piece_up_left = getConcretePiece(row_up_left, col_up_left, tempPieces);
            if(piece_up_left && piece_up_left.color === turn) stop_up_left = true;
            if(row_up_left >= 0 && col_up_left >= 0 && !stop_up_left) {
                movements.push({ row: row_up_left, column: col_up_left})
            }
            if(piece_up_left && piece_up_left.color !== turn) stop_up_left = true;

            // Down right diagonal
            let row_down_right = row + i;
            let col_down_right = column + i;
            let piece_down_right = getConcretePiece(row_down_right, col_down_right, tempPieces);
            if(piece_down_right && piece_down_right.color === turn) stop_down_right = true;
            if(row_down_right < 8 && col_down_right < 8 && !stop_down_right) {
                const move = { row: row_down_right, column: col_down_right};
                if(checkLegalMoves && isLegalMove(move, row, column))
                    movements.push(move);
                else
                    movements.push(move)
            }
            if(piece_down_right && piece_down_right.color !== turn) stop_down_right = true;

            // Down left diagonal
            let row_down_left = row + i;
            let col_down_left = column - i;
            let piece_down_left = getConcretePiece(row_down_left, col_down_left, tempPieces);
            if(piece_down_left && piece_down_left.color === turn) stop_down_left = true;
            if(row_down_left < 8 && col_down_left >= 0 && !stop_down_left) {
                const move = ({ row: row_down_left, column: col_down_left});
                if(checkLegalMoves && isLegalMove(move, row, column))
                    movements.push(move);
                else
                    movements.push(move)
            } 
            if(piece_down_left && piece_down_left.color !== turn) stop_down_left = true;
        }

        return {
            piece: PiecesEnum.BISHOP,
            moves: movements,
        };
    }

    const getRookMoves = (row: number, column: number, checkLegalMoves: boolean, tempPieces: PiecesType | null = null, limit_moves: number = 8): PossibleMovesType => {
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
            let piece_right = getConcretePiece(row, right, tempPieces);
            if(piece_right && piece_right.color === turn) stop_right = true;
            if((row >= 0 && right < 8 && !stop_right)) {
                const move = { row: row, column: right};
                if(checkLegalMoves && isLegalMove(move, row, column))
                    movements.push(move);
                else
                    movements.push(move)
            }
            if(piece_right && piece_right.color !== turn) stop_right = true;

            // Left
            let left = column - i;
            let piece_up_left = getConcretePiece(row, left, tempPieces);
            if(piece_up_left && piece_up_left.color === turn) stop_left = true;
            if(row >= 0 && left >= 0 && !stop_left) {
                const move = { row: row, column: left};
                if(checkLegalMoves && isLegalMove(move, row, column))
                    movements.push(move);
                else
                    movements.push(move)
            }
            if(piece_up_left && piece_up_left.color !== turn) stop_left = true;

            // Up
            let up = row - i;
            let piece_down_right = getConcretePiece(up, column, tempPieces);
            if(piece_down_right && piece_down_right.color === turn) stop_up = true;
            if(up < 8 && column < 8 && !stop_up) {
                const move = { row: up, column: column };
                if(checkLegalMoves && isLegalMove(move, row, column))
                    movements.push(move)
                else
                    movements.push(move)
            }
            if(piece_down_right && piece_down_right.color !== turn) stop_up = true;

            // Down
            let down = row + i;
            let piece_down_left = getConcretePiece(down, column, tempPieces);
            if(piece_down_left && piece_down_left.color === turn) stop_down = true;
            if(down < 8 && column >= 0 && !stop_down) {
                const move = { row: down, column: column };
                if(checkLegalMoves && isLegalMove(move, row, column))
                    movements.push(move)
                else
                    movements.push(move)
            } 
            if(piece_down_left && piece_down_left.color !== turn) stop_down = true;
        }
        
        return {
            piece: PiecesEnum.ROOK,
            moves: movements,
        };
    }

    const getQueenMoves = (row: number, column: number, checkLegalMoves: boolean): PossibleMovesType => {
        if(row === null || column === null) return { piece: PiecesEnum.QUEEN, moves: [] };
        return {
            piece: PiecesEnum.QUEEN,
            moves: [getBishopMoves(row, column, checkLegalMoves).moves, getRookMoves(row, column, checkLegalMoves).moves].flat()
        };
    }

    const getKingMoves = (row: number, column: number, checkLegalMoves: boolean): PossibleMovesType => {
        if(row === null || column === null) return { piece: PiecesEnum.KING, moves: [] };
        return {
            piece: PiecesEnum.KING,
            moves: [getBishopMoves(row, column, checkLegalMoves, null, 2).moves, getRookMoves(row, column, checkLegalMoves, null, 2).moves].flat()
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
            const moves = getPossibleMoves(piece.row, piece.column, _newPieces);
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

    const isLegalMove = (move: any, original_row: number, original_column: number) => {
        // TODO: fix this function
        const isLeavingCheck = isMoveLeavingKingInCheck(move, getConcretePiece(original_row, original_column));
        console.log(check, isLeavingCheck)
        if(!check && !isLeavingCheck)
            return true;
        
        const capture = checkAttacks.some((attacker: any) => attacker.origin_row === move.row && attacker.origin_column === move.column);
        const block = getBlockAttack(move);
        console.log(capture, block)
        if(capture || block)
            return true;

        return false;
    }

    const getBlockAttack = (move: any) => {
		// Return false if there are more than one attacker
		if (checkAttacks.length > 1) return false;

		// Get the first attacker
		const attacker = checkAttacks[0];

		// Return false if the attacker is a knight, as knights cannot be blocked by their movement nature
		if (attacker.piece === PiecesEnum.KNIGHT) return false;

		// Find the king of the current player's turn
		const king = Object.values(pieces).find(
			(piece) => piece.color === turn && piece.type === PiecesEnum.KING
		);
		if (!king || king.row === undefined || king.column === undefined)
			return;

		// Find the minimum and maximum row and column values between the king and attacker
		const minRow = Math.min(king.row, attacker.origin_row);
		const maxRow = Math.max(king.row, attacker.origin_row);
		const minColumn = Math.min(king.column, attacker.origin_column);
		const maxColumn = Math.max(king.column, attacker.origin_column);

		// Check if the move is in the same line (row, column, or diagonal) as the attacker and the king
		if (
			(king.row === attacker.origin_row && king.row === move.row) ||
			(king.column === attacker.origin_column &&
				king.column === move.column) ||
			(Math.abs(king.row - attacker.origin_row) ===
				Math.abs(king.column - attacker.origin_column) &&
				Math.abs(king.row - move.row) ===
					Math.abs(king.column - move.column) &&
				Math.abs(attacker.origin_row - move.row) ===
					Math.abs(attacker.origin_column - move.column))
		) {
			// Check if the move is within the minimum and maximum row and column values
			if (
				move.row >= minRow &&
				move.row <= maxRow &&
				move.column >= minColumn &&
				move.column <= maxColumn
			) {
				return true;
			}
		}

		return false;
	};

    const isMoveLeavingKingInCheck = (move: any, piece: PieceType) => {
        if(!piece) return false;
        const tempPieces: PiecesType = { ...pieces };

        // Update the position of the moved piece in the tempPieces object
        tempPieces[`${move.row}-${move.column}`] = {
          ...piece,
          row: move.row,
          column: move.column,
        };
      
        // Remove the original piece from the tempPieces object
        delete tempPieces[`${piece.row}-${piece.column}`];
      
        // Find the king's position after the move
        const king = Object.values(tempPieces).find(
          (tempPiece) => tempPiece.type === PiecesEnum.KING && tempPiece.color === turn
        );
        if (!king || king.row === undefined || king.column === undefined) {
          return false;
        }
      
        // Check if any opponent piece can still attack the king after the move
        const opponentColor = turn === Turn.WHITE ? Turn.BLACK : Turn.WHITE;
        for (const tempPiece of Object.values(tempPieces)) {
          if (tempPiece.color !== opponentColor) continue;
          const moves = getPossibleMoves(tempPiece.row!, tempPiece.column!, tempPieces, false);
          if(!moves || !moves.moves) return
          for (const possibleMove of moves.moves) {
            if (possibleMove.row === king.row && possibleMove.column === king.column) {
              return true;
            }
          }
        }
      
        return false;
    };
 
    const handleTurns = () => {
        setTurn(turn === Turn.WHITE ? Turn.BLACK : Turn.WHITE);
    }

    const getConcretePiece = (row: number, column: number, tempPieces: PiecesType | null = null) => tempPieces ? tempPieces[`${row}-${column}`] : pieces[`${row}-${column}`]

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

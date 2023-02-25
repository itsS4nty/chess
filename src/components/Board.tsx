import React, { useState } from 'react';
import styled from 'styled-components';
import { PiecesEnum } from '../enums/pieces';
import { PiecesType, PieceType } from '../types/piece';
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
		'0-0': { color: 'black', type: PiecesEnum.ROOK },
		'0-1': { color: 'black', type: PiecesEnum.KNIGHT },
		'0-2': { color: 'black', type: PiecesEnum.BISHOP },
		'0-3': { color: 'black', type: PiecesEnum.QUEEN },
		'0-4': { color: 'black', type: PiecesEnum.KING },
		'0-5': { color: 'black', type: PiecesEnum.BISHOP },
		'0-6': { color: 'black', type: PiecesEnum.KNIGHT },
		'0-7': { color: 'black', type: PiecesEnum.ROOK },
		'1-0': { color: 'black', type: PiecesEnum.PAWN },
		'1-1': { color: 'black', type: PiecesEnum.PAWN },
		'1-2': { color: 'black', type: PiecesEnum.PAWN },
		'1-3': { color: 'black', type: PiecesEnum.PAWN },
		'1-4': { color: 'black', type: PiecesEnum.PAWN },
		'1-5': { color: 'black', type: PiecesEnum.PAWN },
		'1-6': { color: 'black', type: PiecesEnum.PAWN },
		'1-7': { color: 'black', type: PiecesEnum.PAWN },
		'6-0': { color: 'white', type: PiecesEnum.PAWN },
		'6-1': { color: 'white', type: PiecesEnum.PAWN },
		'6-2': { color: 'white', type: PiecesEnum.PAWN },
		'6-3': { color: 'white', type: PiecesEnum.PAWN },
		'6-4': { color: 'white', type: PiecesEnum.PAWN },
		'6-5': { color: 'white', type: PiecesEnum.PAWN },
		'6-6': { color: 'white', type: PiecesEnum.PAWN },
		'6-7': { color: 'white', type: PiecesEnum.PAWN },
		'7-0': { color: 'white', type: PiecesEnum.ROOK },
		'7-1': { color: 'white', type: PiecesEnum.KNIGHT },
		'7-2': { color: 'white', type: PiecesEnum.BISHOP },
		'7-3': { color: 'white', type: PiecesEnum.QUEEN },
		'7-4': { color: 'white', type: PiecesEnum.KING },
		'7-5': { color: 'white', type: PiecesEnum.BISHOP },
		'7-6': { color: 'white', type: PiecesEnum.KNIGHT },
		'7-7': { color: 'white', type: PiecesEnum.ROOK },
	});
    const [selectedRow, setSelectedRow] = useState<number | null>(null);
    const [selectedColumn, setSelectedColumn] = useState<number | null>(null);
    const [turn, setTurn] = useState(0);

    const handleOnClick = (row: number, column: number) => {
        // Can't use (!selectedRow || !selectedColumn) because if we
        // click on row or column 0 it'll never work
        // as it'll detects it as falsy
        let newPieces = {...pieces};
        if(selectedRow === null || selectedColumn === null) {
            setSelectedRow(row);
            setSelectedColumn(column);
            let possible_moves = getPossibleMoves(row, column);
            if(possible_moves && possible_moves.length) {
                possible_moves.forEach(move => {
                    newPieces[`${move.row}-${move.column}`] = { type: PiecesEnum.BULLET, isPossibleMove: true, pawnFirstDoubleMove: move.pawnFirstDoubleMove }
                });
                setPieces(newPieces)
            }
            return;
        }
        const piece = getConcretePiece(row, column);
        if(!piece || !piece.isPossibleMove) return;
        newPieces = Object.fromEntries(Object.entries(newPieces).filter(([, value]) => !value.isPossibleMove));
        newPieces[`${row}-${column}`] = pieces[`${selectedRow}-${selectedColumn}`];

        if(newPieces[`${selectedRow}-${selectedColumn}`].type === PiecesEnum.PAWN)
            newPieces[`${row}-${column}`] = handlePawnMove(newPieces[`${selectedRow}-${selectedColumn}`], piece);

        delete newPieces[`${selectedRow}-${selectedColumn}`];
        setPieces(newPieces);
        setSelectedColumn(null);
        setSelectedRow(null);
        handleTurns();
    }
    
    const getPossibleMoves = (row: number, column: number) => {
        const piece_type = pieces[`${row}-${column}`].type;
        switch(piece_type) {
            case PiecesEnum.PAWN:
                return getPawnMoves(row, column);
        }
    }

    const getPawnMoves = (row: number, column: number) => {
        if(row === null || column === null) return;
        const negative_numbers = turn === 0;
        let movements = [];
        let first_move = turn === 0 ? row === 6 : row === 1;

        if(first_move && !getConcretePiece(row+getCalculationNumber(2, negative_numbers), column))
            movements.push({ row: row + getCalculationNumber(2, negative_numbers), column: column, pawnFirstDoubleMove: true });
        
        if(!getConcretePiece(row+getCalculationNumber(1, negative_numbers), column))
            movements.push({ row: row + getCalculationNumber(1, negative_numbers), column: column });

        console.log(getConcretePiece(row, column+getCalculationNumber(1, true)), getConcretePiece(row, column+getCalculationNumber(1, false)))

        if(getConcretePiece(row+getCalculationNumber(1, negative_numbers), column+getCalculationNumber(1, true)) ||
        (getConcretePiece(row, column+getCalculationNumber(1, true)) && getConcretePiece(row, column+getCalculationNumber(1, true)).pawnFirstDoubleMove))
            movements.push({ row: row+getCalculationNumber(1, negative_numbers), column: column+getCalculationNumber(1, true)});
        
        if(getConcretePiece(row+getCalculationNumber(1, negative_numbers), column+getCalculationNumber(1, false)) ||
            (getConcretePiece(row, column+getCalculationNumber(1, false)) && getConcretePiece(row, column+getCalculationNumber(1, false)).pawnFirstDoubleMove))
            movements.push({ row: row+getCalculationNumber(1, negative_numbers), column: column+getCalculationNumber(1, false)});

        return movements;
    }

    const handlePawnMove = (newPiece: PieceType, clickPiece: PieceType) => {
        if(clickPiece.pawnFirstDoubleMove)
            newPiece.pawnFirstDoubleMove = true;

        if(clickPiece.isPossibleMove && clickPiece.type === PiecesEnum.BULLET) {

        }

        return newPiece;
    }

    const handleTurns = () => {
        setTurn(turn === 0 ? 1 : 0);
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

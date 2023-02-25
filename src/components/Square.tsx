import React from 'react';
import styled from 'styled-components';
import { PieceType } from '../types/piece';

const Container = styled.div<{ even: boolean }>`
	width: 7.5em;
	height: 7.5em;
	background-color: ${(props) => (props.even ? '#000066' : 'cornflowerblue')};
	display: flex;
	align-items: center;
	justify-content: center;
	color: white;
	cursor: pointer;
`;

type SquareProps = {
	even: boolean;
	piece: PieceType;
	onClick: () => void;
};

const Square = ({ even, piece, onClick }: SquareProps) => {
	return (
		<Container even={even} onClick={onClick}>
			{piece && piece.isPossibleMove ? <span>O</span> : piece && piece.type}
		</Container>
	);
};

export default Square;

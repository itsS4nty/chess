import React from 'react';
import styled from 'styled-components';
import Board from '../components/Board';

const Container = styled.div`
	height: 100%;
	width: 100%;
	background-color: #e3e3e3;
	display: flex;
	align-items: center;
	justify-content: center;
`;

const BoardWrapper = styled.div`
	height: 60em;
	width: 60em;
`;

const Main = () => {
	return (
		<Container>
			<BoardWrapper>
                <Board />
            </BoardWrapper>
		</Container>
	);
};

export default Main;

import React from 'react';
import styled from 'styled-components';
import Main from './pages/Main';
import './reset.css';

const Container = styled.div`
	height: 100vh;
	width: 100%;
`;

function App() {
	return (
		<Container>
			<Main />
		</Container>
	);
}

export default App;

import React, {useState} from 'react';
import ChatPage from './components/ChatPage';
import ChatSettingPage from './components/ChatSettingPage';
import ReviewPage from './components/ReviewPage';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';




const App = ()=> {

	const [SettingDone,setSettingDone] = useState<boolean>(false);

	return (
		<Router>
			<Routes>
				<Route path="/" element={SettingDone?<Navigate to="/chatpage"/> : <Navigate to="/setting"/>}/>
				<Route path="/chatpage" element={<ChatPage/>} />
				<Route path="/setting" element={<ChatSettingPage/>}/>
				<Route path="/review" element={<ReviewPage/>}/>
				<Route path="*" element={<div>404 Not Found</div>} />
			</Routes>
		</Router>
	);
}

export default App;

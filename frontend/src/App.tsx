import React, {useState} from 'react';
import styles from './styles.module.css'
import ChatPage from './components/ChatPage';
import ChatSettingPage from './components/ChatSettingPage';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Divider from '@mui/material/Divider'




const App = ()=> {

	const [SettingDone,setSettingDone] = useState<boolean>(false)

	return (
	<Router>
		<Routes>
			<Route path="/" element={SettingDone?<Navigate to="/chatpage"/> : <Navigate to="/chat-settings"/>}/>
			<Route path="/chatpage" element={SettingDone?<ChatPage/> : <Navigate to="/chat-settings"/>}/>
			<Route path="/chat-settings" element={!SettingDone?<ChatSettingPage SettingDone={SettingDone} setSettingDone={setSettingDone}/> : <Navigate to="/chatpage"/>}/>
		</Routes>
	</Router>
	// <div className={styles["test-main"]}>
	//   <ChatPage/>
	//   <Divider/>
	//   <ChatSettings SettingDone={SettingDone} setSettingDone={setSettingDone}/>
	// </div>
	);
}

export default App;

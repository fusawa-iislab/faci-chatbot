import React, { useState } from 'react';
import { TextField, InputLabel } from '@mui/material';

const TimeInput = () => {
    const [minutes, setMinutes] = useState('');
    const [seconds, setSeconds] = useState('');

    return (
        <div style={{ display: 'flex', gap: '16px' }}>
            <TextField
                label="Minutes"
                type="number"
                value={minutes}
                onChange={(e) => setMinutes(e.target.value)}/>
            <TextField
                label="Seconds"
                type="number"
                value={seconds}
                onChange={(e) => setSeconds(e.target.value)}
            />
        </div>
    );
};

export default TimeInput;

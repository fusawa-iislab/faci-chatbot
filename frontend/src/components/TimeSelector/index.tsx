import React, { useState } from 'react';
import { InputLabel, MenuItem, Select, SelectChangeEvent } from '@mui/material';

type TimeSelectorProps = {
    handleTimeChange: (minute: string, second: string) => void;
    time: { minute: string, second: string };
}

const TimeSelector: React.FC<TimeSelectorProps> = ({ 
    handleTimeChange,
    time
}) => {
    return (
        <div style={{ display: 'flex' }}>
            <div style={{ marginRight: '10px', }}>
                <InputLabel>Minute</InputLabel>
                <Select
                    value={time.minute}
                    onChange={(e)=>handleTimeChange(e.target.value, time.second)}
                    label="Minutes"
                >
                    {Array.from({ length: 60 }, (_, minute) => (
                        <MenuItem key={minute} value={minute}>
                            {minute}
                        </MenuItem>
                    ))}
                </Select>
            </div>
            <div>
                <InputLabel>Second</InputLabel>
                <Select
                    value={time.second}
                    onChange={(e)=>handleTimeChange(time.minute, e.target.value)}
                    label="Seconds"
                >
                    {Array.from({ length: 60 }, (_, second) => (
                        <MenuItem key={second} value={second}>
                            {second}
                        </MenuItem>
                    ))}
                </Select>
            </div>
        </div>
    );
};


export default TimeSelector;

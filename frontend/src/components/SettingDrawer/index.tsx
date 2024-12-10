import * as React from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import Button from '@mui/material/Button';
import DensityMediumIcon from '@mui/icons-material/DensityMedium';
import { Person } from '../../assets/CommonStructs';
import styles from "./styles.module.css"


export type SettingDrawerProps = {
}

const SettingDrawer: React.FC<SettingDrawerProps> = (
    participants,

) => {
  const [open, setOpen] = React.useState(false);

  const toggleDrawer = (newOpen: boolean) => () => {
    setOpen(newOpen);
  };

  const DrawerList = (
    <Box sx={{ width: 250 }} onClick={toggleDrawer(false)}>

    </Box>
  );

  return (
    <div>
      <Button onClick={toggleDrawer(true)}><DensityMediumIcon/></Button>
      <Drawer open={open} onClose={toggleDrawer(false)}>
        {DrawerList}
      </Drawer>
    </div>
  );
};

export default SettingDrawer;

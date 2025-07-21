import React from 'react';
import {
  ListItem,
  ListItemButton,
  ListItemText,
  Box,
  Chip,
} from '@mui/material';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import type { DailyReportSummary } from '../../../types/api';
import type { DateString } from '../../../types/domain';

type DailyReportItemProps = {
  report: DailyReportSummary;
  selectedDate?: DateString;
  onDateSelect: (date: DateString, reportInfo: { title: string; tags: string[] }) => void;
};

// 日付文字列に曜日を追加する関数
const formatDateWithWeekday = (dateString: DateString): string => {
  const date = new Date(dateString);
  const weekday = format(date, '(E)', { locale: ja });
  return `${dateString}${weekday}`;
};

export const DailyReportItem: React.FC<DailyReportItemProps> = React.memo(({
  report,
  selectedDate,
  onDateSelect,
}) => {
  return (
    <ListItem disablePadding>
      <ListItemButton
        selected={selectedDate === report.date}
        onClick={() => onDateSelect(report.date, { title: report.title, tags: report.tags || [] })}
        sx={{
          borderBottom: 1,
          borderColor: 'divider',
          '&.Mui-selected': {
            bgcolor: 'action.selected',
            '&:hover': {
              bgcolor: 'action.selected',
            },
          },
          '&:hover': {
            bgcolor: 'action.hover',
          },
          transition: 'background-color 0.2s',
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <ListItemText
            primary={formatDateWithWeekday(report.date)}
            secondary={report.title}
            primaryTypographyProps={{
              variant: 'body2',
              fontWeight: selectedDate === report.date ? 'bold' : 'normal',
              color: 'white',
            }}
            secondaryTypographyProps={{
              variant: 'caption',
              sx: {
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                display: 'block',
                color: 'rgba(255, 255, 255, 0.7)',
              },
            }}
          />
          {report.tags && report.tags.length > 0 && (
            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 0.5 }}>
              {report.tags.map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: '0.7rem',
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                    color: 'rgba(255, 255, 255, 0.8)',
                  }}
                />
              ))}
            </Box>
          )}
        </Box>
      </ListItemButton>
    </ListItem>
  );
});

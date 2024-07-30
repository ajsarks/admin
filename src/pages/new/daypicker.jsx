import React from 'react';
import Select from 'react-select';

const DayTimePicker = ({ availability, setAvailability }) => {
  const daysOptions = [
    { value: "Monday", label: "Monday" },
    { value: "Tuesday", label: "Tuesday" },
    { value: "Wednesday", label: "Wednesday" },
    { value: "Thursday", label: "Thursday" },
    { value: "Friday", label: "Friday" },
    { value: "Saturday", label: "Saturday" },
    { value: "Sunday", label: "Sunday" },
  ];

  const handleDayChange = selectedOptions => {
    const updatedAvailability = selectedOptions.map(option => ({
      day: option.value,
      timeRanges: availability.find(item => item.day === option.value)?.timeRanges || [{ start: '09:00', end: '17:00' }]
    }));
    setAvailability(updatedAvailability);
  };

  return (
    <div>
      <Select
        options={daysOptions}
        isMulti
        onChange={handleDayChange}
        value={daysOptions.filter(option => availability.some(avail => avail.day === option.value))}
        className="availability-select"
      />
      {availability.map((dayAvail, dayIndex) => (
        <div key={dayIndex} className="day-time-ranges">
          <h4>{dayAvail.day}</h4>
          {dayAvail.timeRanges.map((range, index) => (
            <div key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
              <input type="time" value={range.start} onChange={e => setAvailability([...availability.slice(0, dayIndex), {...dayAvail, timeRanges: [...dayAvail.timeRanges.slice(0, index), {...range, start: e.target.value}, ...dayAvail.timeRanges.slice(index + 1)]}, ...availability.slice(dayIndex + 1)])} />
              <span style={{ margin: '0 10px' }}>to</span>
              <input type="time" value={range.end} onChange={e => setAvailability([...availability.slice(0, dayIndex), {...dayAvail, timeRanges: [...dayAvail.timeRanges.slice(0, index), {...range, end: e.target.value}, ...dayAvail.timeRanges.slice(index + 1)]}, ...availability.slice(dayIndex + 1)])} />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default DayTimePicker;

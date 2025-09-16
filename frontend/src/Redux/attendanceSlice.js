// src/redux/attendanceSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api';

export const fetchAttendance = createAsyncThunk(
  'attendance/fetchAttendance',
  async (_, thunkAPI) => {
    try {
      const response = await api.get('/attendance');
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  }
);

const attendanceSlice = createSlice({
  name: 'attendance',
  initialState: {
    records: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAttendance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAttendance.fulfilled, (state, action) => {
        state.loading = false;
        state.records = action.payload;
      })
      .addCase(fetchAttendance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default attendanceSlice.reducer;

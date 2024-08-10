import { useEffect, useState, useCallback } from "react";
import axios from "axios";

// Create an axios instance with default configurations
const axiosInstance = axios.create({
  withCredentials: true, // This ensures all requests include credentials
});

const useFetch = (url) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null); // Reset error state before making a new request
        try {
            const res = await axiosInstance.get(url);
            setData(res.data);
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false); // Ensure loading is set to false in both success and error cases
        }
    }, [url]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { data, loading, error, reFetch: fetchData };
};

export default useFetch;
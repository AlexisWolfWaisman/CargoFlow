/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

const API_URL = 'http://127.0.0.1:5001/api';

const handleResponse = async (response: Response) => {
    if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error:", errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
        return response.json();
    }
    return {};
};

export const fetchData = async (endpoint: string) => {
    try {
        const response = await fetch(`${API_URL}/${endpoint}`);
        return await handleResponse(response);
    } catch (error) {
        console.error(`Error fetching ${endpoint}:`, error);
        alert(`Error al cargar datos de ${endpoint}. Asegúrate de que el servidor backend esté en ejecución.`);
        throw error;
    }
};

export const addItem = async (endpoint: string, item: any) => {
    try {
        const response = await fetch(`${API_URL}/${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(item),
        });
        return await handleResponse(response);
    } catch (error) {
        console.error(`Error adding item to ${endpoint}:`, error);
        throw error;
    }
};

export const updateItem = async (endpoint: string, id: string | number, item: any) => {
    try {
        const response = await fetch(`${API_URL}/${endpoint}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(item),
        });
        return await handleResponse(response);
    } catch (error) {
        console.error(`Error updating item at ${endpoint}/${id}:`, error);
        throw error;
    }
};

export const deleteItem = async (endpoint: string, id: string | number) => {
    try {
        const response = await fetch(`${API_URL}/${endpoint}/${id}`, {
            method: 'DELETE',
        });
        return await handleResponse(response);
    } catch (error) {
        console.error(`Error deleting item at ${endpoint}/${id}:`, error);
        throw error;
    }
};

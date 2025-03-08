// src/store/atoms/index.js
import { atom } from 'recoil'

// Authentication state
export const loginState = atom({
    key: 'loginState',
    default: false,
})

// User role state
export const userRoleState = atom({
    key: 'userRoleState',
    default: 'consumer', // Default to consumer role
})

// Toast notifications
export const toastState = atom({
    key: 'toastState',
    default: '',
})

// Product related states
export const buyerAddressState = atom({
    key: 'buyerAddressState',
    default: '',
})

export const productIdState = atom({
    key: 'productIdState',
    default: '',
})

export const productIdHomeState = atom({
    key: 'productIdHomeState',
    default: '',
})

export const secretIdState = atom({
    key: 'secretIdState',
    default: '',
})

export const newOwnerState = atom({
    key: 'newOwnerState',
    default: '',
})

// Fallback state for QR scanning
export const fallbackState = atom({
    key: 'fallbackState',
    default: '',
})
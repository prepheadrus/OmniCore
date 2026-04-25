import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface LicenseState {
  isActivated: boolean;
  licenseKey: string;
  licenseType: string;
  ownerName: string;
  company: string;
  expiresAt: string;
  status: string;
  setLicense: (data: {
    key: string;
    type: string;
    ownerName: string;
    company: string;
    expiresAt: string;
    status: string;
  }) => void;
  clearLicense: () => void;
}

export const useLicenseStore = create<LicenseState>()(
  persist(
    (set) => ({
      isActivated: false,
      licenseKey: '',
      licenseType: '',
      ownerName: '',
      company: '',
      expiresAt: '',
      status: 'inactive',
      setLicense: (data) =>
        set({
          isActivated: true,
          licenseKey: data.key,
          licenseType: data.type,
          ownerName: data.ownerName,
          company: data.company,
          expiresAt: data.expiresAt,
          status: data.status,
        }),
      clearLicense: () =>
        set({
          isActivated: false,
          licenseKey: '',
          licenseType: '',
          ownerName: '',
          company: '',
          expiresAt: '',
          status: 'inactive',
        }),
    }),
    {
      name: 'pazarlogic-license',
    }
  )
);

# MRI Imaging File Formats

This document describes how MRI (Magnetic Resonance Imaging) machines store imaging data, and the most common file formats used in clinical and research settings.

## Overview

MRI scanners generate large volumes of imaging data, which must be stored in standardized file formats for analysis, sharing, and archiving. The choice of format affects compatibility with software, metadata storage, and data integrity.

## Common MRI File Formats

### 1. DICOM (.dcm)

* **Description:** The Digital Imaging and Communications in Medicine (DICOM) standard is the most widely used format for medical imaging, including MRI.

* **Features:**

  * Stores both image data and rich metadata (patient info, scan parameters, etc.)

  * Supports multi-frame (3D/4D) data

  * Universally supported by clinical PACS systems and most imaging software

* **Typical extension:** `.dcm`

### 2. NIfTI (.nii, .nii.gz)

* **Description:** The Neuroimaging Informatics Technology Initiative (NIfTI) format is popular in neuroscience and research.

* **Features:**

  * Designed for storing 3D and 4D brain imaging data

  * Contains both image data and essential metadata

  * Supports compression (`.nii.gz`)

* **Typical extensions:** `.nii`, `.nii.gz`

### 3. Analyze 7.5 (.img/.hdr)

* **Description:** An older research format, now largely replaced by NIfTI.

* **Features:**

  * Stores image data in `.img` and header info in `.hdr`

  * Lacks some metadata features of NIfTI

* **Typical extensions:** `.img`, `.hdr`

### 4. Other Formats

* **MINC:** Used in some research settings, especially in Canada

* **MHA/MHD (MetaImage):** Used for medical image processing

* **Proprietary formats:** Some MRI vendors use proprietary formats internally, but typically export to DICOM or NIfTI

## Conversion and Interoperability

* **DICOM to NIfTI:** Tools like `dcm2niix` are commonly used to convert DICOM series to NIfTI for research workflows.

* **Software Support:** Most modern imaging software (e.g., SPM, FSL, AFNI, 3D Slicer) support both DICOM and NIfTI.

## Summary Table

| Format  | Typical Use        | Metadata Support | Compression | Notes                |
| ------- | ------------------ | ---------------- | ----------- | -------------------- |
| DICOM   | Clinical, research | Extensive        | No\*        | Standard in medicine |
| NIfTI   | Research, neuro    | Good             | Yes         | Preferred for fMRI   |
| Analyze | Legacy research    | Limited          | No          | Superseded by NIfTI  |

\*DICOM files are not compressed by default, but can be stored in compressed transfer syntaxes.

## References

* [DICOM Standard](https://www.dicomstandard.org/)

* [NIfTI Format](https://nifti.nimh.nih.gov/)

* [dcm2niix Converter](https://github.com/rordenlab/dcm2niix)


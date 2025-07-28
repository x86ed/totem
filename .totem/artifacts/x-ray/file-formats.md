# X-Ray Imaging File Formats

This document describes how X-ray machines store imaging data and the most common file formats used in clinical and research settings.

## Overview

X-ray imaging is one of the oldest and most widely used medical imaging techniques. Like other modalities, X-ray images are stored in standardized file formats to ensure compatibility, data integrity, and interoperability between devices and software.

## Common X-Ray File Formats

### 1. DICOM (.dcm)

See [Working with DICOM Files](dicom.md) for details on viewing, converting, and extracting metadata from DICOM X-ray images.

- **Description:** DICOM (Digital Imaging and Communications in Medicine) is the universal standard for medical imaging, including X-ray.
- **Features:**
  - Stores both image data and metadata (patient info, acquisition parameters, etc.)
  - Supports grayscale and color images
  - Used in virtually all hospitals and clinics
- **Typical extension:** `.dcm`

### 2. TIFF (.tif, .tiff)

See [Working with TIFF Files](tiff.md) for details on viewing, converting, and handling TIFF X-ray images.

- **Description:** Tagged Image File Format (TIFF) is sometimes used for exporting X-ray images, especially in research or for publication.
- **Features:**
  - High-quality, lossless image storage
  - Can store metadata, but not standardized for medical use
- **Typical extensions:** `.tif`, `.tiff`

### 3. JPEG (.jpg, .jpeg)

See [Working with JPEG Files](jpeg.md) for details on viewing, converting, and handling JPEG X-ray images.

- **Description:** JPEG is a common image format for sharing or archiving X-ray images outside of clinical systems.
- **Features:**
  - Compressed, lossy format (may reduce image quality)
  - Not recommended for diagnostic use
- **Typical extensions:** `.jpg`, `.jpeg`

### 4. PNG (.png)

See [Working with PNG Files](png.md) for details on viewing, converting, and handling PNG X-ray images.

- **Description:** Portable Network Graphics (PNG) is sometimes used for screenshots or web sharing of X-ray images.
- **Features:**
  - Lossless compression
  - Not a medical standard
- **Typical extension:** `.png`

## Conversion and Interoperability

- **DICOM to Image:** X-ray DICOM files can be converted to TIFF, JPEG, or PNG for research, publication, or sharing using tools like ImageJ, RadiAnt, or dcm2jpg.
- **Software Support:** Most medical imaging viewers and PACS systems support DICOM. General image viewers support TIFF, JPEG, and PNG.

## Summary Table

| Format   | Typical Use         | Metadata Support | Compression | Notes                        |
|----------|---------------------|------------------|-------------|------------------------------|
| DICOM    | Clinical, research  | Extensive        | No*         | Medical standard             |
| TIFF     | Research, export    | Limited          | Optional    | High quality, not a standard |
| JPEG     | Sharing, archive    | Minimal          | Yes         | Lossy, not for diagnosis     |
| PNG      | Web, screenshots    | Minimal          | Yes         | Lossless, not a standard     |

*DICOM files are not compressed by default, but can be stored in compressed transfer syntaxes.

## References

- [DICOM Standard](https://www.dicomstandard.org/)
- [ImageJ Software](https://imagej.nih.gov/ij/)
- [RadiAnt DICOM Viewer](https://www.radiantviewer.com/)

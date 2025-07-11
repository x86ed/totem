# Working with DICOM Files (.dcm)

DICOM (Digital Imaging and Communications in Medicine) is the standard format for medical imaging, including X-ray. This guide covers how to view, convert, and process DICOM files.

## Viewing DICOM Files
- Use medical image viewers such as:
  - RadiAnt DICOM Viewer (Windows)
  - OsiriX (macOS)
  - Horos (macOS)
  - MicroDicom (Windows)
  - Weasis (cross-platform)
- Many PACS systems and hospital software support DICOM natively.

## Converting DICOM Files
- Convert DICOM to standard image formats (TIFF, JPEG, PNG) using:
  - ImageJ (Plugins > Import > DICOM)
  - dcm2jpg (https://github.com/ivmartel/dcm2jpg)
  - RadiAnt (Export function)

## Extracting Metadata
- Use `dcmdump` (from DCMTK) or `pydicom` (Python library) to inspect and extract metadata.

## Useful Tools
- [DCMTK](https://dicom.offis.de/dcmtk.php.en)
- [pydicom](https://pydicom.github.io/)
- [ImageJ](https://imagej.nih.gov/ij/)

## References
- [DICOM Standard](https://www.dicomstandard.org/)

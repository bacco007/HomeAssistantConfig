# Contributing to ADSB Aircraft Tracker

Thank you for your interest in contributing to the ADSB Aircraft Tracker Home Assistant integration!

## Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/hook-365/adsb-aircraft-tracker.git
   cd adsb-aircraft-tracker
   ```

2. **Development Environment**
   - Home Assistant 2023.1 or newer
   - Python 3.11+
   - ADSB feeder (dump1090/tar1090) for testing

3. **Installation for Development**
   - Copy the `custom_components/adsb_aircraft_tracker/` directory to your Home Assistant `custom_components/` folder
   - Restart Home Assistant
   - Add the integration through Settings → Devices & Services

## Code Style

- Follow PEP 8 Python style guidelines
- Use type hints where possible
- Add docstrings for all functions and classes
- Keep functions focused and well-named

## Testing

- Test with actual ADSB data when possible
- Verify military detection accuracy with known military aircraft
- Test configuration changes through the UI
- Check that database loading works reliably

## Submitting Changes

1. **Fork the repository** on GitHub
2. **Create a feature branch** from `main`
   ```bash
   git checkout -b feature/my-new-feature
   ```
3. **Make your changes** with clear, focused commits
4. **Test thoroughly** with your Home Assistant setup
5. **Update documentation** if needed (README.md, CHANGELOG.md)
6. **Submit a Pull Request** with:
   - Clear description of changes
   - Why the change is needed
   - How it was tested

## Issues and Bug Reports

When reporting issues, please include:
- Home Assistant version
- Integration version
- ADSB feeder type (dump1090, tar1090, etc.)
- Relevant log entries from Home Assistant
- Steps to reproduce the issue

## Database and Detection

- **Military Database**: The integration uses the tar1090-db from Mictronics
- **Detection Logic**: Database-only approach for accuracy
- **No Pattern Matching**: Intentionally removed to prevent false positives

## Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Help create a welcoming environment for all contributors

## Questions?

- Open an issue for bugs or feature requests
- Check existing issues before creating new ones
- Be specific and provide context

Thank you for contributing! 🛩️
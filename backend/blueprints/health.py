from flask import Blueprint, jsonify
from utils.dependency_checker import get_all_dependencies

health_bp = Blueprint('health', __name__)

@health_bp.route('/health/dependencies', methods=['GET'])
def check_dependencies():
    """Endpoint to check all system dependencies"""
    deps = get_all_dependencies()
    
    # Calculate overall status
    critical_missing = []
    for name, info in deps.items():
        if not info.get("optional", False) and not info["installed"]:
            critical_missing.append(name)
    
    status = "degraded" if critical_missing else "healthy"
    
    return jsonify({
        "status": status,
        "dependencies": deps,
        "critical_missing": critical_missing
    })

@health_bp.route('/health', methods=['GET'])
def simple_health():
    """Simple health check endpoint"""
    return jsonify({"status": "ok"})
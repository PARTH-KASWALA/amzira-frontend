from pathlib import Path
import re

PDP_PATH = Path('/Users/parthkaswala/Desktop/amzira-frontend/product-detail.html')


def read_pdp() -> str:
    return PDP_PATH.read_text(encoding='utf-8')


def test_manyavar_style_structure_blocks_exist() -> None:
    html = read_pdp()
    required_ids = [
        'class="pdp-wrapper"',
        'class="pdp-left"',
        'id="thumbnailColumn"',
        'id="mainImageContainer"',
        'id="mainImageStack"',
        'id="productSku"',
        'id="stockPill"',
        'id="addToCartBtn"',
        'id="addToWishlist"',
        'id="relatedProducts"',
        'id="stickyBuyBar"',
        'id="stickyAddToCartBtn"',
        'id="pincodeInput"',
        'id="deliveryResult"',
        "initPdpTabs()",
        "viewsTabText",
    ]
    for marker in required_ids:
        assert marker in html, f'Missing PDP element: {marker}'

    assert 'thumbnail-column' in html


def test_emi_and_pay_now_removed_from_pdp() -> None:
    html = read_pdp().lower()
    assert 'emi from' not in html
    assert 'pay now' not in html


def test_pdp_maps_required_backend_fields_in_script() -> None:
    html = read_pdp()
    # These tokens verify the UI reads backend contract fields for PDP mapping.
    expected_tokens = [
        'product?.sku',
        'product?.id',
        'sale_price',
        'base_price',
        'product?.images',
        'product.variants',
        'stock_quantity',
        '/delivery-estimate?pincode=',
        'reviews_data',
    ]
    for token in expected_tokens:
        assert token in html, f'Expected backend mapping token missing: {token}'


def test_sticky_bar_scroll_logic_present() -> None:
    html = read_pdp()
    assert 'function updateStickyBar' in html
    assert re.search(r'window\.addEventListener\(\'scroll\'', html) is not None

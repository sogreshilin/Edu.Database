from app.service import bp


@bp.route('/api/edit/add/excess', methods=['POST'])
def add_excess():
    pass


@bp.route('/api/edit/add/extra', methods=['POST'])
def add_extra():
    pass


@bp.route('/api/edit/add/penalty', methods=['POST'])
def add_penalty():
    pass



@bp.route('/api/edit/excess', methods=['POST'])
def edit_excess():
    pass


@bp.route('/api/edit/extra', methods=['POST'])
def edit_extra():
    pass


@bp.route('/api/edit/penalty', methods=['POST'])
def edit_penalty():
    pass


@bp.route('/api/edit/house_rental', methods=['POST'])
def edit_house_rental():
    pass


@bp.route('/api/edit/remove/excess', methods=['POST'])
def remove_penalty():
    pass


@bp.route('/api/edit/remove/penalty', methods=['POST'])
def remove_penalty():
    pass


@bp.route('/api/edit/remove/extra', methods=['POST'])
def penalty():
    pass


